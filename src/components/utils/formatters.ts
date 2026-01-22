export const parseDistance = (val: string | null): number =>
  val ? parseFloat(val.replace(" km", "")) : 0;

export const parseDuration = (val: string | null): number =>
  val ? parseFloat(val.replace(" min", "")) : 0;
