interface DBMeterInterface {
  start(cb?: (dbLevel: number) => void, errCb?: (err: any) => void): void;
  stop(cb?: () => void, errCb?: (err: any) => void): void;
}

declare const DBMeter: DBMeterInterface;