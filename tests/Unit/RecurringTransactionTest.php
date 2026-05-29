<?php

use App\Models\RecurringTransaction;

it('amount accessor converts stored cents to dollars', function () {
    $r = new RecurringTransaction;
    $r->setRawAttributes(['amount' => 10000]);

    expect($r->amount)->toEqual(100);
});

it('amount mutator converts dollars to cents', function () {
    $r = new RecurringTransaction;
    $r->amount = 99.99;

    expect($r->getAttributes()['amount'])->toEqual(9999);
});

it('amount accessor does not double-divide', function () {
    $r = new RecurringTransaction;
    $r->setRawAttributes(['amount' => 5000]);

    // 5000 cents = $50. Must NOT return $0.50
    expect($r->amount)->toEqual(50)
        ->and($r->amount)->not->toEqual(0.5);
});

it('amount_in_dollars accessor no longer exists', function () {
    $r = new RecurringTransaction;
    expect(method_exists($r, 'getAmountInDollarsAttribute'))->toBeFalse();
});

it('round-trip preserves value', function () {
    $r = new RecurringTransaction;
    $r->amount = 250.75;

    $r->setRawAttributes(['amount' => $r->getAttributes()['amount']]);
    expect($r->amount)->toEqual(250.75);
});
