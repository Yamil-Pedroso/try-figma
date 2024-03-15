import exp from "constants";

declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module 'fabric/fabric-impl' {
  export const fabric: any;
  export const Gradient: any;
  export const Pattern: any;
  export const fabricImpl: any;
}
