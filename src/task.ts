import { TaskManager } from "./task-manager";
import { CronParts, CronType } from "./types";
import { v4 as uuidv4, v4 } from "uuid";
import EventEmitter from "events";

export type TaskStatus = "CREATED" | "RUNNING" | "KILLED" | "PAUSED";

export class DebugTickerExecutor {
  /**
   * Represents an executor for scheduled tasks in debug mode.
   *
   * @param executorId - The unique identifier for the executor.
   * @param cb - The callback function to be executed.
   */
  constructor(
    public readonly executorId: number,
    public readonly cb: VoidFunction
  ) {}
}
export class Task {
  private readonly id: string;
  public readonly name: string;
  public readonly expression: string;
  public handler: () => void;
  private readonly cronType: CronType;
  private status: TaskStatus;
  public readonly cronParts?: CronParts;
  public readonly autoStart: boolean;
  private lastRunAt?: Date;
  private readonly emitter: EventEmitter;
  public readonly tz: string;

  /**
   * Creates a new scheduled task instance.
   *
   * @param name - The name of the task.
   * @param expression - The cron expression or recurrence pattern.
   * @param handler - The function to be executed when the task runs.
   * @param cronType - The type of cron (e.g., interval, cron expression).
   * @param emitter - Event emitter to manage task events.
   * @param cronParts - Parsed cron parts (optional).
   * @param autoStart - Whether the task should start automatically (default: true).
   */
  constructor(
    name: string,
    expression: string,
    handler: () => void,
    cronType: CronType,
    emitter: EventEmitter,
    cronParts?: CronParts,
    autoStart: boolean = true,
    timezone: string = "utc"
  ) {
    this.id = uuidv4();
    this.name = name;
    this.expression = expression;
    this.handler = handler;
    this.cronType = cronType;
    this.status = "CREATED";
    this.cronParts = cronParts;
    this.autoStart = autoStart;
    this.emitter = emitter;
    this.tz = timezone;
  }

  /**
   * Prints the task details in a human-readable format.
   */
  public prettyPrint() {
    console.log(
      `
---------------------
Task Details:
---------------------
ID: ${this.id}
Name: ${this.name}
Type: ${this.cronType}
Status: ${this.status}
Expression: ${this.expression}
Handler: ${this.handler.toString()}
AutoStart: ${this.autoStart}
LastRun: ${this.lastRunAt}`
    );
  }

  /**
   * Resumes the task if it is paused.
   */
  public resume() {
    this.status = "RUNNING";
  }

  /**
   * Pauses the task execution.
   */
  public pause() {
    this.status = "PAUSED";
  }

  /**
   * Checks if the task is eligible to run based on its status.
   *
   * @returns True if the task can run, otherwise false.
   */
  public ableToRun() {
    return (
      this.status !== "PAUSED" &&
      this.status !== "KILLED" &&
      this.status !== "CREATED"
    );
  }

  /**
   * Stops the task by emitting a "kill-task" event.
   */
  public stop() {
    this.emitter.emit("kill-task", this.getId());
    this.status = "KILLED";
  }

  /**
   * Retrieves the unique identifier of the task.
   *
   * @returns The task ID.
   */
  public getId() {
    return this.id;
  }

  /**
   * Updates the last execution date of the task.
   *
   * @param date - The date of the last execution.
   */
  public updateLastRun(date: Date) {
    this.lastRunAt = date;
  }
}
