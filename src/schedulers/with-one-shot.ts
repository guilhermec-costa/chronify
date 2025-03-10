import { TaskArgs } from "../types";
import { getTzNow } from "../utils";
import { Scheduler } from "./scheduler";

export class WithOneShot extends Scheduler {
  public schedule({
    handler,
    repr,
    options: { autoStart, debugTick, name = "unknown", timeZone = "utc" },
  }: TaskArgs) {
    this.logger.debug(`Scheduling task using One Shot method: ${repr}`);
    const moment = new Date(repr);
    const isMomentValid = moment.getTime() >= Date.now();
    if (!isMomentValid) {
      throw new Error("Target date should be greater/equal to current date");
    }

    const parsedCron = this.patternValidator.getCronPartsIfValid(
      repr as string
    );
    const t = this.taskManager.makeTask(
      name,
      repr,
      handler,
      "ExpressionBased",
      autoStart,
      parsedCron,
      timeZone
    );
    this.applyAutoStartConfig(t);
    const i = setInterval(() => {
      const now = getTzNow(t.tz);
      if (Date.now() >= moment.getTime() && t.ableToRun()) {
        handler();
        t.updateLastRun(new Date());
        clearInterval(i);
      }
    }, 1000);

    let tickerId;
    if (debugTick) {
      tickerId = this.debugTickerActivator(t, debugTick);
    }

    this.taskManager.executorStorage.set(t.getId(), {
      mainExecutorId: i,
      debugTickerId: tickerId,
    });

    return t;
  }
}
