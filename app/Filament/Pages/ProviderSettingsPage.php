<?php

namespace App\Filament\Pages;

use App\Support\AiSettings;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;

class ProviderSettingsPage extends Page implements HasForms
{
    use InteractsWithForms;

    protected static string|\BackedEnum|null $navigationIcon = Heroicon::OutlinedCog6Tooth;

    protected static string|\UnitEnum|null $navigationGroup = 'AI Management';

    protected static ?int $navigationSort = 3;

    protected static ?string $navigationLabel = 'Provider Settings';

    protected string $view = 'filament.pages.provider-settings-page';

    public ?array $data = [];

    public function mount(AiSettings $settings): void
    {
        $current = $settings->current();

        $this->form->fill([
            'provider' => $current->provider,
            'model' => $current->model,
            'chat_rate_limit_per_minute' => $current->chat_rate_limit_per_minute,
        ]);
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('provider')
                    ->options([
                        'openai' => 'OpenAI',
                        'anthropic' => 'Anthropic',
                        'gemini' => 'Gemini',
                        'groq' => 'Groq',
                        'ollama' => 'Ollama',
                        'openrouter' => 'OpenRouter',
                    ])
                    ->required(),
                TextInput::make('model')
                    ->required()
                    ->maxLength(255),
                TextInput::make('chat_rate_limit_per_minute')
                    ->label('Chat Rate Limit Per Minute')
                    ->numeric()
                    ->minValue(1)
                    ->required(),
            ])
            ->statePath('data');
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('save')
                ->label('Save Settings')
                ->action('save'),
        ];
    }

    public function save(AiSettings $settings): void
    {
        $state = $this->form->getState();
        $record = $settings->current();

        $record->update([
            'provider' => $state['provider'],
            'model' => $state['model'],
            'chat_rate_limit_per_minute' => (int) $state['chat_rate_limit_per_minute'],
        ]);

        Notification::make()
            ->title('AI settings saved')
            ->success()
            ->send();
    }
}
