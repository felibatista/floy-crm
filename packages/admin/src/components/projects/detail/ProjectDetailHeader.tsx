import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { ArrowLeft, FolderKanban, List } from "lucide-react";

interface ProjectDetailHeaderProps {
  projectName?: string;
  saving: boolean;
  deleting: boolean;
  deleteDialogOpen: boolean;
  onDeleteDialogOpenChange: (open: boolean) => void;
  onBack: () => void;
  onSave: () => void;
  onDelete: () => void;
}

const ProjectDetailHeader = ({
  projectName,
  saving,
  deleting,
  deleteDialogOpen,
  onDeleteDialogOpenChange,
  onBack,
  onSave,
  onDelete,
}: ProjectDetailHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <ButtonGroup>
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Menubar className="border-0 p-0 h-auto rounded-none">
            <MenubarMenu>
              <MenubarTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2 border-l-0 rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onSave}
                    disabled={saving}
                    className="w-full justify-start disabled:opacity-50 text-xs"
                  >
                    Guardar
                  </Button>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem asChild>
                  <Dialog
                    open={deleteDialogOpen}
                    onOpenChange={onDeleteDialogOpenChange}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={saving}
                        className="w-full justify-start text-xs disabled:opacity-50"
                      >
                        Eliminar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>¿Eliminar proyecto?</DialogTitle>
                        <DialogDescription>
                          Esta acción no se puede deshacer. Se eliminarán
                          también todas las tareas, pagos y archivos asociados
                          a este proyecto.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => onDeleteDialogOpenChange(false)}
                          disabled={deleting}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={onDelete}
                          loading={deleting}
                        >
                          Eliminar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </ButtonGroup>

        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-sm font-semibold">{projectName}</h1>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailHeader;
