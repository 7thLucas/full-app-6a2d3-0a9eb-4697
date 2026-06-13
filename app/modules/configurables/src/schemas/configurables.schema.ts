/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};



export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        {
          fieldName: "primary",
          type: "color",
          required: true,
          label: "Primary (Blood Red)",
        },
        {
          fieldName: "secondary",
          type: "color",
          required: true,
          label: "Secondary (Forest Green)",
        },
        {
          fieldName: "accent",
          type: "color",
          required: true,
          label: "Accent (Amber/Moonlight)",
        },
      ],
    },
    {
      fieldName: "gameTagline",
      type: "string",
      required: false,
      label: "Game Tagline",
      maxLength: 120,
    },
    {
      fieldName: "totalNights",
      type: "number",
      required: false,
      label: "Total Nights to Survive",
      min: 10,
      max: 100,
    },
    {
      fieldName: "showHighScores",
      type: "boolean",
      required: false,
      label: "Show High Scores on Title Screen",
    },
    {
      fieldName: "gameTheme",
      type: "object",
      required: false,
      label: "Game Theme Colors",
      fields: [
        {
          fieldName: "bgDark",
          type: "color",
          required: false,
          label: "Background Dark",
        },
        {
          fieldName: "bgMid",
          type: "color",
          required: false,
          label: "Background Mid",
        },
        {
          fieldName: "bloodRed",
          type: "color",
          required: false,
          label: "Blood Red",
        },
        {
          fieldName: "forestGreen",
          type: "color",
          required: false,
          label: "Forest Green",
        },
        {
          fieldName: "amber",
          type: "color",
          required: false,
          label: "Amber/Moonlight",
        },
      ],
    },
    {
      fieldName: "titleScreenCopy",
      type: "object",
      required: false,
      label: "Title Screen Copy",
      fields: [
        {
          fieldName: "subtitle",
          type: "string",
          required: false,
          label: "Subtitle",
        },
        {
          fieldName: "startButtonLabel",
          type: "string",
          required: false,
          label: "Start Button Label",
        },
        {
          fieldName: "howToPlayHeading",
          type: "string",
          required: false,
          label: "How to Play Heading",
        },
      ],
    },
    {
      fieldName: "victoryScreenCopy",
      type: "object",
      required: false,
      label: "Victory Screen Copy",
      fields: [
        {
          fieldName: "heading",
          type: "string",
          required: false,
          label: "Victory Heading",
        },
        {
          fieldName: "message",
          type: "string",
          required: false,
          label: "Victory Message",
        },
        {
          fieldName: "shareText",
          type: "string",
          required: false,
          label: "Share Achievement Text",
        },
      ],
    },
    {
      fieldName: "gameOverCopy",
      type: "object",
      required: false,
      label: "Game Over Screen Copy",
      fields: [
        {
          fieldName: "heading",
          type: "string",
          required: false,
          label: "Game Over Heading",
        },
        {
          fieldName: "retryButtonLabel",
          type: "string",
          required: false,
          label: "Retry Button Label",
        },
      ],
    },
  ],
};
