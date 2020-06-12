import { Address, BigDecimal, Bytes, BigInt } from "@graphprotocol/graph-ts"
import { Transfer } from "../generated/templates/Token/Token"

import { 
    Token, Market
} from "../generated/schema"

import { Token as TokenContract } from "../generated/templates/Token/Token"
import { Token as TokenTemplate } from "../generated/templates"
import { updateBalances } from "./market"

const PI_ADDRESS = "0x0000000000000000000000000000000000000000";

export function handleTransfer(event: Transfer): void {
    let market = Market.load(event.params.to.toHexString());

    if (market != null) {
        updateBalances(event.params.to);
    }
}

export function createToken(tokenAddress: Address): void {
    let token = Token.load(tokenAddress.toHexString());
  
    if (token == null) {
        token = new Token(tokenAddress.toHexString());
  
        if (tokenAddress.toHexString() != PI_ADDRESS) {
            
            let contract = TokenContract.bind(tokenAddress);
        
            let symbol = contract.try_symbol();
            let name = contract.try_name();
            let decimals = contract.try_decimals();
            let supply = contract.try_totalSupply();

            if (!symbol.reverted) {
                token.tokenSymbol = symbol.value;
            } else {
                token.tokenSymbol = "";
            }

            if (!name.reverted) {
                token.tokenName = name.value;
            } else {
                token.tokenName = "";
            }

            if (!decimals.reverted) {
                token.tokenDecimals = decimals.value;
            } else {
                token.tokenDecimals = 0;
            }

            if (!supply.reverted) {
                token.totalSupply = supply.value.toBigDecimal();
            } else {
                token.totalSupply = BigDecimal.fromString('0');
            }

            if ((!symbol.reverted) && (!name.reverted) && (!decimals.reverted) && (!supply.reverted)) {
                token.updated = true;
            } else {
                token.updated = false;
            }

        } else {
            token.tokenSymbol = "PI";
            token.tokenName = "PI";
            token.tokenDecimals = 18;
            token.totalSupply = BigDecimal.fromString('0');
            token.updated = true;
        }

        TokenTemplate.create(tokenAddress);
    }
  
    token.save();
}