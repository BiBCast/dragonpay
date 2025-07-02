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

import { Account } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Wallet<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags wallet
   * @name GetWallet
   * @request GET:/wallet
   * @secure
   */
  getWallet = (params: RequestParams = {}) =>
    this.request<Account[], any>({
      path: `/wallet`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags wallet
   * @name GetWalletTest
   * @summary Restituisce il conto dell'utente
   * @request GET:/wallet/test
   * @secure
   */
  getWalletTest = (params: RequestParams = {}) =>
    this.request<Account, any>({
      path: `/wallet/test`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
}
