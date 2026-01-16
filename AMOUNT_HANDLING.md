# Amount Handling Convention

## Rule: Models Handle Conversion, Controllers Don't

All monetary amounts in the database are stored as **cents (integers)**.

### Models with Accessors & Mutators
These models automatically handle conversion:
- `Budget` - amount
- `Transaction` - amount  
- `Account` - balance
- `Goal` - target_amount, current_amount
- `RecurringTransaction` - amount

**Accessor (get)**: Divides by 100 (cents → dollars)
**Mutator (set)**: Multiplies by 100 (dollars → cents)

### Controller Rule
**NEVER multiply by 100 in controllers** - the model mutator handles it automatically.

```php
// ✅ CORRECT
$validated['amount'] = $request->amount; // e.g., 50.00
Model::create($validated); // Mutator stores as 5000 cents

// ❌ WRONG
$validated['amount'] = $request->amount * 100; // e.g., 5000
Model::create($validated); // Mutator multiplies again = 500000 cents!
```

### Database Queries with Aggregates
When using `sum()`, `avg()`, etc., use `DB::raw()` to avoid accessor:

```php
// ✅ CORRECT - Gets raw cents, then divide once
$total = Transaction::sum(DB::raw('amount')) / 100;

// ❌ WRONG - Accessor already divided, this is wrong
$total = Transaction::get()->sum('amount');
```
