'use server';

import { revalidatePath } from 'next/cache';
import { DEMO_USER_ID } from './config';
import { createPartyRequest, joinPartyRequest, submitReview } from './data';
import type { CreateReviewInput, NewPartyInput } from './types';

export async function submitReviewAction(input: CreateReviewInput) {
  const result = await submitReview(input);
  revalidatePath('/calendar');
  revalidatePath('/home');
  return result;
}

export async function joinPartyAction(partyId: string, userId: string = DEMO_USER_ID) {
  const result = await joinPartyRequest(partyId, userId);
  revalidatePath(`/party/${partyId}`);
  return result;
}

export async function createPartyAction(input: Omit<NewPartyInput, 'hostUserId'>) {
  const { id } = await createPartyRequest({ ...input, hostUserId: DEMO_USER_ID });
  revalidatePath(`/party/${id}`);
  return { id };
}
