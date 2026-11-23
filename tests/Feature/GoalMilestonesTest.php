<?php

use App\Models\Goal;
use App\Models\User;
use App\Notifications\GoalAchievedNotification;
use App\Notifications\GoalMilestoneNotification;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    Notification::fake();
    $this->travelTo('2026-11-23 12:00:00');
    $this->user = User::factory()->create();
    $this->goal = Goal::create([
        'user_id' => $this->user->id, 'name' => 'Laptop', 'target_amount' => 1000,
        'currency' => 'NGN', 'target_date' => '2027-05-01', 'is_active' => true,
    ]);
});

function contribute(float $amount): void
{
    test()->actingAs(test()->user)->post(route('goals.contribute', test()->goal), [
        'amount' => $amount, 'contribution_date' => '2026-11-23',
    ])->assertSessionHasNoErrors()->assertRedirect(route('goals.index'));
}

function milestonesSent(): array
{
    return Notification::sent(test()->user, GoalMilestoneNotification::class)->pluck('milestone')->all();
}

test('each milestone is celebrated once as contributions add up', function () {
    contribute(100);  // 10%: nothing
    contribute(200);  // 30%: 25
    contribute(50);   // 35%: nothing new
    contribute(200);  // 55%: 50

    expect(milestonesSent())->toBe([25, 50]);
    Notification::assertNotSentTo($this->user, GoalAchievedNotification::class);
});

test('a contribution that jumps several milestones only announces the highest', function () {
    contribute(800);

    expect(milestonesSent())->toBe([75]);
});

test('reaching the target through contributions sends the achieved notification', function () {
    contribute(600);
    contribute(400);

    Notification::assertSentToTimes($this->user, GoalAchievedNotification::class, 1);
    expect($this->goal->fresh()->is_completed)->toBeTrue();
});

test('lowering the target can complete a goal', function () {
    contribute(600);

    $this->actingAs($this->user)->put(route('goals.update', $this->goal), [
        'name' => 'Laptop', 'target_amount' => 500, 'currency' => 'NGN',
    ])->assertSessionHasNoErrors();

    Notification::assertSentToTimes($this->user, GoalAchievedNotification::class, 1);
});

test('milestone message includes the monthly amount needed to finish on time', function () {
    contribute(300);

    $data = Notification::sent($this->user, GoalMilestoneNotification::class)->first()->toArray($this->user);

    // ₦700 left over 5 whole months (late Nov → 1 May) = ₦140 a month
    expect($data['message'])->toContain('₦700.00 to go')->toContain('₦140.00 a month')->toContain('May 2027');
});

test('suggested monthly contribution', function (?string $targetDate, float $saved, ?float $expected) {
    $this->goal->update(['target_date' => $targetDate, 'current_amount' => $saved]);

    expect($this->goal->fresh()->suggestedMonthlyContribution())->toBe($expected);
})->with([
    'five months left' => ['2027-05-01', 300, 140.0],
    'under a month left: whole remainder' => ['2026-12-10', 300, 700.0],
    'target date passed' => ['2026-10-01', 300, null],
    'no target date' => [null, 300, null],
    'already reached' => ['2027-05-01', 1000, null],
]);

test('the goals page exposes the monthly plan', function () {
    $this->actingAs($this->user)->get(route('goals.index'))
        ->assertInertia(fn ($page) => $page->where('goals.0.suggested_monthly', 200));
});
