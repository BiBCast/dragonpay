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

import { Transaction } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Transactions<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags transactions
   * @name GetTransactions
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
}
