/**
 * Firebase Chat Service
 * Firestore + Storage helpers for realtime chat
 */
import {
    addDoc,
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
    type DocumentData,
    type QuerySnapshot,
    type Timestamp,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { firestore, storage } from '@/lib/firebase';
import type { User } from '@/features/auth/types';
import type { MessageType, SharedCard } from '../types';

export interface ConversationParticipant {
    id: number;
    displayName: string;
    avatarUrl?: string;
}

export interface FirebaseConversation {
    id: string;
    type: 'dm' | 'group';
    participants: ConversationParticipant[];
    participantIds: number[];
    name?: string;
    avatarUrl?: string;
    memberCount?: number;
    lastMessage?: {
        content?: string;
        type: MessageType;
        senderId: number;
        createdAt: Timestamp;
    };
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export interface FirebaseMessageRecord {
    id: string;
    conversationId: string;
    senderId: number;
    senderName?: string;
    senderAvatarUrl?: string;
    messageType: MessageType;
    content?: string;
    imageUrl?: string;
    card?: SharedCard;
    createdAt: string;
    isActive: boolean;
}

interface FirestoreMessageDoc extends DocumentData {
    senderId: number;
    senderName?: string;
    senderAvatarUrl?: string;
    messageType: MessageType;
    content?: string;
    imageUrl?: string;
    card?: SharedCard;
    createdAt?: Timestamp;
    isActive?: boolean;
}

export function buildDmConversationId(userA: number, userB: number): string {
    const [min, max] = userA < userB ? [userA, userB] : [userB, userA];
    return `dm_${min}_${max}`;
}

export async function getConversation(conversationId: string): Promise<FirebaseConversation | null> {
    const ref = doc(firestore, 'conversations', conversationId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data() as FirebaseConversation;
    return { ...data, id: snap.id };
}

export async function ensureDirectConversation(
    currentUser: User,
    peer: ConversationParticipant
): Promise<string> {
    const conversationId = buildDmConversationId(currentUser.id, peer.id);
    const ref = doc(firestore, 'conversations', conversationId);
    const snap = await getDoc(ref);

    if (snap.exists()) {
        return conversationId;
    }

    const participants: ConversationParticipant[] = [
        { id: currentUser.id, displayName: currentUser.displayName, avatarUrl: currentUser.avatarUrl },
        { id: peer.id, displayName: peer.displayName, avatarUrl: peer.avatarUrl },
    ];

    const payload: Omit<FirebaseConversation, 'id'> = {
        type: 'dm',
        participants,
        participantIds: participants.map((p) => p.id),
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
    };

    await setDoc(ref, payload);
    return conversationId;
}

function mapMessageSnapshot(
    conversationId: string,
    docId: string,
    data: FirestoreMessageDoc
): FirebaseMessageRecord {
    const createdAt = data.createdAt?.toDate?.() ?? new Date();
    return {
        id: docId,
        conversationId,
        senderId: data.senderId,
        senderName: data.senderName,
        senderAvatarUrl: data.senderAvatarUrl,
        messageType: data.messageType,
        content: data.content,
        imageUrl: data.imageUrl,
        card: data.card,
        createdAt: createdAt.toISOString(),
        isActive: data.isActive ?? true,
    };
}

export function subscribeToMessages(
    conversationId: string,
    onMessages: (messages: FirebaseMessageRecord[]) => void,
    onError?: (error: Error) => void
): () => void {
    const messagesRef = collection(firestore, 'conversations', conversationId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
        messagesQuery,
        (snapshot: QuerySnapshot<DocumentData>) => {
            const messages = snapshot.docs.map((docSnap) =>
                mapMessageSnapshot(
                    conversationId,
                    docSnap.id,
                    docSnap.data() as FirestoreMessageDoc
                )
            );
            onMessages(messages);
        },
        (error) => {
            if (onError) onError(error as Error);
        }
    );

    return unsubscribe;
}

async function updateConversationLastMessage(
    conversationId: string,
    message: {
        content?: string;
        type: MessageType;
        senderId: number;
    }
): Promise<void> {
    const conversationRef = doc(firestore, 'conversations', conversationId);
    const payload = {
        lastMessage: {
            content: message.content ?? '',
            type: message.type,
            senderId: message.senderId,
            createdAt: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
    };

    try {
        await updateDoc(conversationRef, payload);
    } catch {
        await setDoc(conversationRef, payload, { merge: true });
    }
}

export async function sendTextMessage(
    conversationId: string,
    sender: ConversationParticipant,
    content: string
): Promise<FirebaseMessageRecord> {
    const messagesRef = collection(firestore, 'conversations', conversationId, 'messages');
    const docRef = await addDoc(messagesRef, {
        senderId: sender.id,
        senderName: sender.displayName,
        senderAvatarUrl: sender.avatarUrl,
        messageType: 'text',
        content,
        createdAt: serverTimestamp(),
        isActive: true,
    });

    await updateConversationLastMessage(conversationId, {
        content,
        type: 'text',
        senderId: sender.id,
    });

    return {
        id: docRef.id,
        conversationId,
        senderId: sender.id,
        senderName: sender.displayName,
        senderAvatarUrl: sender.avatarUrl,
        messageType: 'text',
        content,
        createdAt: new Date().toISOString(),
        isActive: true,
    };
}

export async function sendSharedCardMessage(
    conversationId: string,
    sender: ConversationParticipant,
    card: SharedCard
): Promise<FirebaseMessageRecord> {
    const messagesRef = collection(firestore, 'conversations', conversationId, 'messages');
    const docRef = await addDoc(messagesRef, {
        senderId: sender.id,
        senderName: sender.displayName,
        senderAvatarUrl: sender.avatarUrl,
        messageType: 'sharedCard',
        card,
        createdAt: serverTimestamp(),
        isActive: true,
    });

    await updateConversationLastMessage(conversationId, {
        content: card.title,
        type: 'sharedCard',
        senderId: sender.id,
    });

    return {
        id: docRef.id,
        conversationId,
        senderId: sender.id,
        senderName: sender.displayName,
        senderAvatarUrl: sender.avatarUrl,
        messageType: 'sharedCard',
        card,
        createdAt: new Date().toISOString(),
        isActive: true,
    };
}

export async function sendImageMessage(
    conversationId: string,
    sender: ConversationParticipant,
    file: { uri: string; name: string; type: string },
    caption?: string
): Promise<FirebaseMessageRecord> {
    const response = await fetch(file.uri);
    const blob = await response.blob();

    const storagePath = `chat/${conversationId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, blob, { contentType: file.type });
    const downloadUrl = await getDownloadURL(storageRef);

    const messagesRef = collection(firestore, 'conversations', conversationId, 'messages');
    const docRef = await addDoc(messagesRef, {
        senderId: sender.id,
        senderName: sender.displayName,
        senderAvatarUrl: sender.avatarUrl,
        messageType: 'image',
        content: caption ?? '',
        imageUrl: downloadUrl,
        createdAt: serverTimestamp(),
        isActive: true,
    });

    await updateConversationLastMessage(conversationId, {
        content: caption ?? '[Image]',
        type: 'image',
        senderId: sender.id,
    });

    return {
        id: docRef.id,
        conversationId,
        senderId: sender.id,
        senderName: sender.displayName,
        senderAvatarUrl: sender.avatarUrl,
        messageType: 'image',
        content: caption ?? '',
        imageUrl: downloadUrl,
        createdAt: new Date().toISOString(),
        isActive: true,
    };
}

export async function unsendMessage(conversationId: string, messageId: string): Promise<void> {
    const messageRef = doc(firestore, 'conversations', conversationId, 'messages', messageId);
    await updateDoc(messageRef, {
        isActive: false,
        content: '',
        imageUrl: null,
        card: null,
    });
}

export async function deleteConversationForUser(
    conversationId: string,
    userId: number
): Promise<void> {
    const conversationRef = doc(firestore, 'conversations', conversationId);
    await updateDoc(conversationRef, {
        deletedFor: arrayUnion(userId),
        updatedAt: serverTimestamp(),
    });
}

export async function getMediaMessages(conversationId: string): Promise<FirebaseMessageRecord[]> {
    const messagesRef = collection(firestore, 'conversations', conversationId, 'messages');
    const mediaQuery = query(
        messagesRef,
        where('messageType', '==', 'image'),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(mediaQuery);

    return snapshot.docs.map((docSnap) =>
        mapMessageSnapshot(
            conversationId,
            docSnap.id,
            docSnap.data() as FirestoreMessageDoc
        )
    );
}

export async function getAllMessages(conversationId: string): Promise<FirebaseMessageRecord[]> {
    const messagesRef = collection(firestore, 'conversations', conversationId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(messagesQuery);

    return snapshot.docs.map((docSnap) =>
        mapMessageSnapshot(
            conversationId,
            docSnap.id,
            docSnap.data() as FirestoreMessageDoc
        )
    );
}
