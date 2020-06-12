import { BigInt, BigDecimal, Address } from "@graphprotocol/graph-ts"
import {
  Controller as ControllerContract,
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

  let controllerContract = ControllerContract.bind(Address.fromHexString(address) as Address);
  let commission = controllerContract.try_commission();

  if (!commission.reverted) {
    controller.commission = commission.value.toBigDecimal();
    controller.updated = true;
  } else {
    controller.commission = BigDecimal.fromString('0');
    controller.updated = false;
  }

  controller.save();
}
