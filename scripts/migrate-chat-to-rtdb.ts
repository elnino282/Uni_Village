/**
 * Chat Migration Script: Firestore + Legacy Backend → Firebase RTDB
 *
 * This script migrates chat data from:
 * 1. Firebase Firestore (existing Firebase chat implementation)
 * 2. Legacy Java backend database (if historical data export is available)
 *
 * Target: Firebase Realtime Database
 *
 * Usage:
 *   npx ts-node scripts/migrate-chat-to-rtdb.ts [options]
 *
 * Options:
 *   --firestore-only    Only migrate Firestore data
 *   --legacy-only       Only migrate legacy backend data (requires JSON file)
 *   --legacy-file       Path to legacy data JSON export
 *   --dry-run           Preview changes without writing to RTDB
 *   --batch-size        Number of records per batch (default: 100)
 */

import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

// Initialize Firebase Admin SDK
const serviceAccountPath = path.resolve(
  __dirname,
  "../firebase-service-account.json",
);

if (!fs.existsSync(serviceAccountPath)) {
  console.error("Error: firebase-service-account.json not found");
  console.error(
    "Please download it from Firebase Console > Project Settings > Service Accounts",
  );
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://fluent-anagram-479106-v2-default-rtdb.asia-southeast1.firebasedatabase.app/",
});

const firestore = admin.firestore();
const database = admin.database();

// ============================================================================
// Types
// ============================================================================

interface FirestoreMessage {
  senderId: number;
  senderName?: string;
  senderAvatarUrl?: string;
  messageType: "text" | "sharedCard" | "image";
  content?: string;
  imageUrl?: string;
  card?: {
    id: string;
    title: string;
    imageUrl: string;
    ctaText: string;
    route: string;
  };
  createdAt: admintore.Timestamp;
  isActive?: boolean;
}

interface FirestoreConversation {
  type: "dm" | "group";
  participants: {
    id: number;
    displayName: string;
    avatarUrl?: string;
  }[];
  participantIds: number[];
  name?: string;
  avatarUrl?: string;
  lastMessage?: {
    content?: string;
    type: string;
    senderId: number;
    createdAt: admin.firestore.Timestamp;
  };
  createdAt?: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.Timestamp;
}

interface LegacyMessage {
  id: string | number;
  conversationId: string;
  senderId: number;
  senderName?: string;
  content: string;
  messageType?: string;
  imageUrl?: string;
  createdAt: string | number;
  isActive?: boolean;
}

interface LegacyConversation {
  id: string;
  type: "dm" | "group";
  participantIds: number[];
  participants?: {
    id: number;
    displayName: string;
    avatarUrl?: string;
  }[];
  name?: string;
  createdAt: string | number;
}

interface UserIdMapping {
  legacyId: number;
  firebaseUid: string;
}

interface MigrationStats {
  conversationsMigrated: number;
  messagesMigrated: number;
  errors: string[];
  startTime: Date;
  endTime?: Date;
}

// ============================================================================
// Configuration
// ============================================================================

const config = {
  dryRun: process.argv.includes("--dry-run"),
  firestoreOnly: process.argv.includes("--firestore-only"),
  legacyOnly: process.argv.includes("--legacy-only"),
  batchSize: parseInt(
    process.argv
      .find((arg) => arg.startsWith("--batch-size="))
      ?.split("=")[1] ?? "100",
  ),
  legacyFile: process.argv
    .find((arg) => arg.startsWith("--legacy-file="))
    ?.split("=")[1],
};

console.log("Migration Configuration:", config);

// ============================================================================
// User ID Mapping
// ============================================================================

/**
 * Load or create user ID mapping (legacy ID → Firebase UID)
 * In production, this should come from your user database
 */
async function loadUserIdMapping(): Promise<Map<number, string>> {
  const mappingPath = path.resolve(__dirname, "../user-id-mapping.json");

  if (fs.existsSync(mappingPath)) {
    const data = JSON.parse(
      fs.readFileSync(mappingPath, "utf-8"),
    ) as UserIdMapping[];
    return new Map(data.map((m) => [m.legacyId, m.firebaseUid]));
  }

  console.warn("No user ID mapping file found. Using legacy IDs as strings.");
  return new Map();
}

/**
 * Get Firebase UID for a legacy user ID
 * Falls back to string conversion if no mapping exists
 */
function getFirebaseUid(
  legacyId: number,
  mapping: Map<number, string>,
): string {
  return mapping.get(legacyId) ?? `legacy_${legacyId}`;
}

// ============================================================================
// Firestore Migration
// ============================================================================

async function migrateFirestoreData(
  userIdMapping: Map<number, string>,
  stats: MigrationStats,
): Promise<void> {
  console.log("\n=== Migrating Firestore Data ===\n");

  // Get all conversations from Firestore
  const conversationsSnapshot = await firestore
    .collection("conversations")
    .get();

  console.log(`Found ${conversationsSnapshot.size} conversations in Firestore`);

  for (const convDoc of conversationsSnapshot.docs) {
    try {
      const convData = convDoc.data() as FirestoreConversation;
      const conversationId = convDoc.id;

      console.log(`\nMigrating conversation: ${conversationId}`);

      // Build RTDB conversation structure
      const members: Record<string, true> = {};
      const memberDetails: Record<string, any> = {};

      for (const participant of convData.participants ?? []) {
        const uid = getFirebaseUid(participant.id, userIdMapping);
        members[uid] = true;
        memberDetails[uid] = {
          displayName: participant.displayName,
          avatarUrl: participant.avatarUrl,
          legacyUserId: participant.id,
          joinedAt: convData.createdAt?.toMillis() ?? Date.now(),
        };
      }

      // Fallback if no participants array
      if (Object.keys(members).length === 0 && convData.participantIds) {
        for (const legacyId of convData.participantIds) {
          const uid = getFirebaseUid(legacyId, userIdMapping);
          members[uid] = true;
          memberDetails[uid] = {
            displayName: `User ${legacyId}`,
            legacyUserId: legacyId,
            joinedAt: convData.createdAt?.toMillis() ?? Date.now(),
          };
        }
      }

      const rtdbConversation = {
        type: convData.type,
        members,
        memberDetails,
        name: convData.name,
        avatarUrl: convData.avatarUrl,
        lastMessage: convData.lastMessage?.content,
        lastMessageAt: convData.lastMessage?.createdAt?.toMillis(),
        lastMessageType: convData.lastMessage?.type,
        lastMessageSenderId: convData.lastMessage?.senderId
          ? getFirebaseUid(convData.lastMessage.senderId, userIdMapping)
          : undefined,
        createdAt: convData.createdAt?.toMillis() ?? Date.now(),
        updatedAt: convData.updatedAt?.toMillis() ?? Date.now(),
      };

      // Remove undefined values
      Object.keys(rtdbConversation).forEach((key) => {
        if (
          rtdbConversation[key as keyof typeof rtdbConversation] === undefined
        ) {
          delete rtdbConversation[key as keyof typeof rtdbConversation];
        }
      });

      // Write conversation to RTDB
      if (!config.dryRun) {
        await database
          .ref(`conversations/${conversationId}`)
          .set(rtdbConversation);

        // Write userConversations entries
        for (const uid of Object.keys(members)) {
          await database
            .ref(`userConversations/${uid}/${conversationId}`)
            .set(true);
        }
      } else {
        console.log(
          "  [DRY RUN] Would write conversation:",
          JSON.stringify(rtdbConversation, null, 2).substring(0, 200),
        );
      }

      stats.conversationsMigrated++;

      // Migrate messages for this conversation
      const messagesSnapshot = await firestore
        .collection("conversations")
        .doc(conversationId)
        .collection("messages")
        .orderBy("createdAt", "asc")
        .get();

      console.log(`  Found ${messagesSnapshot.size} messages`);

      const messageBatch: Record<string, any> = {};
      let messageCount = 0;

      for (const msgDoc of messagesSnapshot.docs) {
        const msgData = msgDoc.data() as FirestoreMessage;
        const messageId = msgDoc.id;

        const rtdbMessage = {
          senderId: getFirebaseUid(msgData.senderId, userIdMapping),
          senderName: msgData.senderName,
          senderAvatarUrl: msgData.senderAvatarUrl,
          legacySenderId: msgData.senderId,
          type: msgData.messageType,
          text: msgData.content,
          imageUrl: msgData.imageUrl,
          card: msgData.card,
          createdAt: msgData.createdAt?.toMillis() ?? Date.now(),
          isActive: msgData.isActive ?? true,
        };

        // Remove undefined values
        Object.keys(rtdbMessage).forEach((key) => {
          if (rtdbMessage[key as keyof typeof rtdbMessage] === undefined) {
            delete rtdbMessage[key as keyof typeof rtdbMessage];
          }
        });

        messageBatch[messageId] = rtdbMessage;
        messageCount++;

        // Write in batches
        if (messageCount % config.batchSize === 0) {
          if (!config.dryRun) {
            await database
              .ref(`messages/${conversationId}`)
              .update(messageBatch);
          }
          console.log(`    Migrated ${messageCount} messages...`);
          Object.keys(messageBatch).forEach((k) => delete messageBatch[k]);
        }
      }

      // Write remaining messages
      if (Object.keys(messageBatch).length > 0 && !config.dryRun) {
        await database.ref(`messages/${conversationId}`).update(messageBatch);
      }

      stats.messagesMigrated += messagesSnapshot.size;
      console.log(`  Migrated ${messagesSnapshot.size} messages`);
    } catch (error) {
      const errorMsg = `Error migrating conversation ${convDoc.id}: ${(error as Error).message}`;
      console.error(errorMsg);
      stats.errors.push(errorMsg);
    }
  }
}

// ============================================================================
// Legacy Backend Migration
// ============================================================================

async function migrateLegacyData(
  userIdMapping: Map<number, string>,
  stats: MigrationStats,
): Promise<void> {
  if (!config.legacyFile) {
    console.log(
      "\n=== Skipping Legacy Data Migration (no file specified) ===\n",
    );
    return;
  }

  console.log("\n=== Migrating Legacy Backend Data ===\n");

  const legacyDataPath = path.resolve(config.legacyFile);

  if (!fs.existsSync(legacyDataPath)) {
    console.error(`Legacy data file not found: ${legacyDataPath}`);
    return;
  }

  const legacyData = JSON.parse(fs.readFileSync(legacyDataPath, "utf-8"));

  const conversations: LegacyConversation[] = legacyData.conversations ?? [];
  const messages: LegacyMessage[] = legacyData.messages ?? [];

  console.log(
    `Found ${conversations.length} conversations and ${messages.length} messages`,
  );

  // Migrate conversations
  for (const conv of conversations) {
    try {
      const members: Record<string, true> = {};
      const memberDetails: Record<string, any> = {};

      for (const legacyId of conv.participantIds) {
        const uid = getFirebaseUid(legacyId, userIdMapping);
        members[uid] = true;

        const participant = conv.participants?.find((p) => p.id === legacyId);
        memberDetails[uid] = {
          displayName: participant?.displayName ?? `User ${legacyId}`,
          avatarUrl: participant?.avatarUrl,
          legacyUserId: legacyId,
          joinedAt:
            typeof conv.createdAt === "string"
              ? new Date(conv.createdAt).getTime()
              : conv.createdAt,
        };
      }

      const createdAtMs =
        typeof conv.createdAt === "string"
          ? new Date(conv.createdAt).getTime()
          : conv.createdAt;

      const rtdbConversation = {
        type: conv.type,
        members,
        memberDetails,
        name: conv.name,
        createdAt: createdAtMs,
        updatedAt: createdAtMs,
      };

      if (!config.dryRun) {
        // Check if conversation already exists (from Firestore migration)
        const existing = await database
          .ref(`conversations/${conv.id}`)
          .once("value");

        if (!existing.exists()) {
          await database.ref(`conversations/${conv.id}`).set(rtdbConversation);

          for (const uid of Object.keys(members)) {
            await database.ref(`userConversations/${uid}/${conv.id}`).set(true);
          }
        } else {
          console.log(`  Conversation ${conv.id} already exists, skipping`);
        }
      }

      stats.conversationsMigrated++;
    } catch (error) {
      const errorMsg = `Error migrating legacy conversation ${conv.id}: ${(error as Error).message}`;
      console.error(errorMsg);
      stats.errors.push(errorMsg);
    }
  }

  // Group messages by conversation
  const messagesByConversation = new Map<string, LegacyMessage[]>();
  for (const msg of messages) {
    const existing = messagesByConversation.get(msg.conversationId) ?? [];
    existing.push(msg);
    messagesByConversation.set(msg.conversationId, existing);
  }

  // Migrate messages
  for (const [conversationId, convMessages] of messagesByConversation) {
    console.log(
      `\nMigrating ${convMessages.length} messages for conversation ${conversationId}`,
    );

    const messageBatch: Record<string, any> = {};
    let count = 0;

    for (const msg of convMessages) {
      try {
        const createdAtMs =
          typeof msg.createdAt === "string"
            ? new Date(msg.createdAt).getTime()
            : msg.createdAt;

        const messageId = msg.id.toString();

        const rtdbMessage = {
          senderId: getFirebaseUid(msg.senderId, userIdMapping),
          senderName: msg.senderName,
          legacySenderId: msg.senderId,
          type: msg.messageType ?? "text",
          text: msg.content,
          imageUrl: msg.imageUrl,
          createdAt: createdAtMs,
          isActive: msg.isActive ?? true,
        };

        // Remove undefined values
        Object.keys(rtdbMessage).forEach((key) => {
          if (rtdbMessage[key as keyof typeof rtdbMessage] === undefined) {
            delete rtdbMessage[key as keyof typeof rtdbMessage];
          }
        });

        messageBatch[messageId] = rtdbMessage;
        count++;

        if (count % config.batchSize === 0) {
          if (!config.dryRun) {
            await database
              .ref(`messages/${conversationId}`)
              .update(messageBatch);
          }
          console.log(`  Migrated ${count} messages...`);
          Object.keys(messageBatch).forEach((k) => delete messageBatch[k]);
        }

        stats.messagesMigrated++;
      } catch (error) {
        const errorMsg = `Error migrating legacy message ${msg.id}: ${(error as Error).message}`;
        console.error(errorMsg);
        stats.errors.push(errorMsg);
      }
    }

    // Write remaining messages
    if (Object.keys(messageBatch).length > 0 && !config.dryRun) {
      await database.ref(`messages/${conversationId}`).update(messageBatch);
    }
  }
}

// ============================================================================
// Update Last Message
// ============================================================================

async function updateLastMessages(stats: MigrationStats): Promise<void> {
  console.log("\n=== Updating Last Messages ===\n");

  const conversationsRef = database.ref("conversations");
  const conversationsSnapshot = await conversationsRef.once("value");

  const conversations = conversationsSnapshot.val() ?? {};

  for (const conversationId of Object.keys(conversations)) {
    try {
      // Get the last message for this conversation
      const messagesSnapshot = await database
        .ref(`messages/${conversationId}`)
        .orderByChild("createdAt")
        .limitToLast(1)
        .once("value");

      const messages = messagesSnapshot.val();

      if (messages) {
        const messageId = Object.keys(messages)[0];
        const lastMessage = messages[messageId];

        const updates = {
          lastMessage:
            lastMessage.text?.substring(0, 100) ??
            (lastMessage.type === "image" ? "[Image]" : "[Message]"),
          lastMessageAt: lastMessage.createdAt,
          lastMessageType: lastMessage.type,
          lastMessageSenderId: lastMessage.senderId,
        };

        if (!config.dryRun) {
          await database.ref(`conversations/${conversationId}`).update(updates);
        }

        console.log(`Updated lastMessage for ${conversationId}`);
      }
    } catch (error) {
      const errorMsg = `Error updating lastMessage for ${conversationId}: ${(error as Error).message}`;
      console.error(errorMsg);
      stats.errors.push(errorMsg);
    }
  }
}

// ============================================================================
// Main Migration
// ============================================================================

async function main(): Promise<void> {
  console.log("========================================");
  console.log("Chat Migration: Firestore/Legacy → RTDB");
  console.log("========================================\n");

  if (config.dryRun) {
    console.log("*** DRY RUN MODE - No changes will be made ***\n");
  }

  const stats: MigrationStats = {
    conversationsMigrated: 0,
    messagesMigrated: 0,
    errors: [],
    startTime: new Date(),
  };

  try {
    // Load user ID mapping
    const userIdMapping = await loadUserIdMapping();
    console.log(`Loaded ${userIdMapping.size} user ID mappings`);

    // Migrate Firestore data
    if (!config.legacyOnly) {
      await migrateFirestoreData(userIdMapping, stats);
    }

    // Migrate legacy backend data
    if (!config.firestoreOnly) {
      await migrateLegacyData(userIdMapping, stats);
    }

    // Update last messages
    if (!config.dryRun) {
      await updateLastMessages(stats);
    }

    stats.endTime = new Date();

    // Print summary
    console.log("\n========================================");
    console.log("Migration Complete!");
    console.log("========================================\n");
    console.log(`Conversations migrated: ${stats.conversationsMigrated}`);
    console.log(`Messages migrated: ${stats.messagesMigrated}`);
    console.log(`Errors: ${stats.errors.length}`);
    console.log(
      `Duration: ${(stats.endTime.getTime() - stats.startTime.getTime()) / 1000}s`,
    );

    if (stats.errors.length > 0) {
      console.log("\nErrors:");
      stats.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }

    // Save migration report
    const reportPath = path.resolve(
      __dirname,
      `../migration-report-${Date.now()}.json`,
    );
    fs.writeFileSync(reportPath, JSON.stringify(stats, null, 2));
    console.log(`\nReport saved to: ${reportPath}`);
  } catch (error) {
    console.error("\nMigration failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
