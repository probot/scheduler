// Type definitions for probot-scheduler v1.2
// Definitions by: Allen Gammel <https://github.com/intolerance>
import { Application } from "probot";

export = createScheduler;

/**
 * `probot-scheduler` A Probot extension to trigger events on an recurring schedule.
 * @param robot {Application} Probot `Application` instance
 * @param [options] {Options} Optional scheduler options.
 */
declare function createScheduler(robot: Application, options?: probotScheduler.Options);

declare namespace probotScheduler {
    /**
     * Scheduler options
     */
    export interface Options {
        /**
         * `delay` - when `false`, the schedule will be performed immediately on startup. When `true`, there will be a `random delay` between 0 and interval for each repository to avoid all schedules being performed at the same time. Default: `true` unless the `DISABLE_DELAY` environment variable is set.
         */
        delay: boolean,
        /**
         * `interval` - the `number of milliseconds` to schedule each repository. Default: 1 hour (`60 * 60 * 1000`)
         */
        interval: number,
    }
}
