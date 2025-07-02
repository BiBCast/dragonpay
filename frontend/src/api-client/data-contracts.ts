/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface Login {
  username: string;
  password: string;
}

export interface Account {
  id?: string;
  user_id?: number;
  balance?: number;
  currency?: string;
  created_at?: string;
}

export interface User {
  id?: number;
  username?: string;
  full_name?: string;
  email?: string;
  created_at?: string;
}

export interface Merchant {
  id?: number;
  name?: string;
  merchant_code?: string;
  created_at?: string;
}

export interface Contact {
  id?: number;
  owner_id?: number;
  contact_id?: number;
  nickname?: string;
  added_at?: string;
}

export interface Transaction {
  id?: string;
  account_id?: string;
  amount?: number;
  currency?: string;
  type?: string;
  status?: string;
  related_id?: string;
  description?: string;
  created_at?: string;
}

export interface PaymentRequest {
  id?: string;
  requester_id?: number;
  requestee_id?: number;
  amount?: number;
  currency?: string;
  message?: string;
  status?: string;
  created_at?: string;
  expires_at?: string;
}
