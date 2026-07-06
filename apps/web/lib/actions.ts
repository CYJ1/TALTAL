'use server';

import { revalidatePath } from 'next/cache';
import { DEMO_USER_ID } from './config';
import { joinPartyRequest, submitReview } from './data';
import type { CreateReviewInput } from './types';

export async function submitReviewAction(input: CreateReviewInput) {
  const result = await submitReview(input);
  revalidatePath('/calendar');
  revalidatePath('/');
  return result;
}

export async function joinPartyAction(partyId: string, userId: string = DEMO_USER_ID) {
  const result = await joinPartyRequest(partyId, userId);
  revalidatePath(`/party/${partyId}`);
  return result;
}
