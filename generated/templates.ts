// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import { Address, DataSourceTemplate } from "@graphprotocol/graph-ts";

export class Token extends DataSourceTemplate {
  static create(address: Address): void {
    DataSourceTemplate.create("Token", [address.toHex()]);
  }
}

export class Market extends DataSourceTemplate {
  static create(address: Address): void {
    DataSourceTemplate.create("Market", [address.toHex()]);
  }
}
