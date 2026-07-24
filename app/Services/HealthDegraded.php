<?php

namespace App\Services;

use RuntimeException;

/**
 * Thrown by a health check when the dependency is reachable but unhealthy
 * (e.g. failed jobs present). Maps to the "degraded" status rather than "down".
 */
class HealthDegraded extends RuntimeException {}
