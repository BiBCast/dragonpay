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
  /** Username dell'utente */
  username: string;
  /** Password in chiaro */
  password: string;
}

export interface Token {
  access_token?: string;
}

export interface Account {
  /** ID del conto */
  id?: string;
  /** Nome del titolare */
  holder?: string;
  /** Saldo attuale */
  balance?: number;
}

export interface Transaction {
  /** ID operazione */
  id?: string;
  /** Timestamp ISO della transazione */
  date?: string;
  /** Importo */
  amount?: number;
  /** Descrizione */
  description?: string;
}

export interface Transfer {
  /** Account di destinazione */
  to_account: string;
  /** Importo del bonifico */
  amount: number;
}

export type TransferResponse = Transfer & {
  /** Status operazione */
  status?: string;
  transaction?: Transaction;
  /** Nuovo saldo */
  new_balance?: number;
};
