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

import { Transaction, Transfer, TransferResponse } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Transactions<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags transactions
   * @name GetTransactions
   * @summary Elenco transazioni dell'utente
   * @request GET:/transactions
   * @secure
   */
  getTransactions = (params: RequestParams = {}) =>
    this.request<Transaction[], any>({
      path: `/transactions`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags transactions
   * @name PostTransfer
   * @summary Esegue un bonifico interno
   * @request POST:/transactions/transfer
   * @secure
   */
  postTransfer = (payload: Transfer, params: RequestParams = {}) =>
    this.request<TransferResponse, any>({
      path: `/transactions/transfer`,
      method: "POST",
      body: payload,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
}
