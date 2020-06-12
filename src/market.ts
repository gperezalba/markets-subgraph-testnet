import { NewMarket } from "../generated/Controller/Controller";
import { Market, Exchange } from "../generated/schema";
import { Market as MarketContract, BuyPi, NewChange, SellPi, NewCommission } from "../generated/templates/Market/Market"
import { Market as MarketTemplate } from "../generated/templates"

export function createMarket(event: NewMarket): void {
    let market = Market.load(event.params.market.toHexString());

    if (market == null) {
        market = new Market(event.params.market.toHexString());
    }

    market.currency1 = event.params.tokenA.toHexString();
    market.currency2 = event.params.tokenB.toHexString();

    let marketContract = MarketContract.bind(event.params.market);

    let balance = marketContract.try_contractBalance();
    let change = marketContract.try_change();
    let commission = marketContract.try_commission();

    if (!balance.reverted) {
        market.currency1Balance = balance.value.value0.toBigDecimal();
        market.currency2Balance = balance.value.value1.toBigDecimal();
    }

    if (!change.reverted) {
        market.change = change.value.toBigDecimal();
    }

    if (!commission.reverted) {
        market.commission = commission.value.toBigDecimal();
    }
    
    if ((!commission.reverted) && (!change.reverted) && (!commission.reverted)) {
        market.updated = true;
    } else {
        market.updated = false;
    }

    market.save();

    MarketTemplate.create(event.params.market);
}

export function handleBuyPi(event: BuyPi): void {
    let exchangeId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
    let exchange = Exchange.load(exchangeId);

    if (exchange == null) {
        exchange = new Exchange(exchangeId);
    }

    exchange.market = event.address.toHexString();
    exchange.isBuyPi = true;
    exchange.operator = event.params.to;
    exchange.amount = event.params.piAmount.toBigDecimal();

    exchange.save();

    let market = Market.load(event.address.toHexString());

    if (market != null) {
        market.exchanges.push(exchange.id);
        market.save();
    }
}

export function handleNewChange(event: NewChange): void {
    let market = Market.load(event.address.toHexString());

    if (market != null) {
        market.commission = event.params.change.toBigDecimal();
        market.save();
    }
}

export function handleNewCommission(event: NewCommission): void {
    let market = Market.load(event.address.toHexString());

    if (market != null) {
        market.commission = event.params.current.toBigDecimal();
        market.save();
    }
}

export function handleSellPi(event: SellPi): void {
    let exchangeId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
    let exchange = Exchange.load(exchangeId);

    if (exchange == null) {
        exchange = new Exchange(exchangeId);
    }

    exchange.market = event.address.toHexString();
    exchange.isBuyPi = false;
    exchange.operator = event.params.to;
    exchange.amount = event.params.tokenAmount.toBigDecimal();

    exchange.save();

    let market = Market.load(event.address.toHexString());

    if (market != null) {
        market.exchanges.push(exchange.id);
        market.save();
    }
}