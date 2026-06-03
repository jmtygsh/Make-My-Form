import { FormComponentModel } from "~/models/form-component";
export const generateJsonSchema = (components: FormComponentModel[]) => {
  return {
    components,
    validation: {},
  };
};
