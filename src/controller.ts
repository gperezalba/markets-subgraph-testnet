import { BigInt, BigDecimal } from "@graphprotocol/graph-ts"
import {
  NewAddress,
  NewCommission,
  NewMarket,
  NewToken
} from "../generated/Controller/Controller"
import { createToken } from "./token";
import { createMarket } from "./market";
import { Controller } from "../generated/schema";

export function handleNewCommission(event: NewCommission): void {
  createControllerIfNull(event.address.toHexString());
  let controller = Controller.load(event.address.toHexString());
  controller.commission = event.params.newCommission.toBigDecimal();
}

export function handleNewMarket(event: NewMarket): void {
  createControllerIfNull(event.address.toHexString());
  createMarket(event);
}

export function handleNewToken(event: NewToken): void {
  createControllerIfNull(event.address.toHexString());
  createToken(event.params.newToken);
}

function createControllerIfNull(address: string): void {
  let controller = Controller.load(address);

  if (controller == null) {
    controller = new Controller(address);
  }

  controller.save();
}
