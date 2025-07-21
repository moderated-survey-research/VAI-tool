declare module "*.config" {
  const value: import("tailwindcss").Config;
  export default value;
}
