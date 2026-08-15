package com.infotact.shadowbase.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Collections;
import java.util.Deque;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.atomic.AtomicLong;

/**
 * In-memory counters + rolling exception log backing the dashboard's
 * "Total Queries / Replayed / Errors / Error Rate" cards and the
 * "Recent SQL Exceptions" table. Swap for a real time-series store
 * (e.g. Prometheus) for production use.
 */
@Service
public class MetricsService {

    public record SqlException(Instant time, String query, String error) {}

    private final AtomicLong received = new AtomicLong();
    private final AtomicLong replayed = new AtomicLong();
    private final AtomicLong errors = new AtomicLong();
    private final Deque<SqlException> recentExceptions = new ConcurrentLinkedDeque<>();

    public void recordQueryReceived() { received.incrementAndGet(); }
    public void recordQueryReplayed() { replayed.incrementAndGet(); }

    public void recordError(String query, String error) {
        errors.incrementAndGet();
        recentExceptions.addFirst(new SqlException(Instant.now(), query, error));
        while (recentExceptions.size() > 50) recentExceptions.removeLast();
    }

    public long getReceived() { return received.get(); }
    public long getReplayed() { return replayed.get(); }
    public long getErrors() { return errors.get(); }

    public double getErrorRate() {
        long total = received.get();
        return total == 0 ? 0.0 : (errors.get() * 100.0) / total;
    }

    public Iterable<SqlException> getRecentExceptions() {
        return Collections.unmodifiableCollection(recentExceptions);
    }
}
