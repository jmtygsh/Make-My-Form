import { useFormBuilderStore } from "~/stores/form-builder-store";
import { OptionsDialog } from "./dialogs/options-dialog";


export function OptionsGroup() {
  const { updateComponent, selectedComponent } = useFormBuilderStore();

  if (!selectedComponent) {
    return null;
  }

  const handleChange = (
    field: string,
    value: any,
    isValidForAllViewports: boolean = false
  ) => {
    if (selectedComponent) {
      updateComponent(
        selectedComponent.id,
        field,
        value,
        isValidForAllViewports
      );
    }
  };

  const showCheckbox =
    selectedComponent.type !== "radio" && selectedComponent.type !== "select";

  return (
    <OptionsDialog
      component={selectedComponent}
      onOptionsChange={(options) => handleChange("options", options, true)}
      showCheckbox={showCheckbox}
    />
  );
}
