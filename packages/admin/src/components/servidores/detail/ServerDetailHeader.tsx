"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, List, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";

const COOLIFY_URL = "https://coolify.acentus.com.ar";

interface ServerDetailHeaderProps {
  projectUuid: string;
  onRefresh: () => void;
  refreshing?: boolean;
}

export function ServerDetailHeader({
  projectUuid,
  onRefresh,
  refreshing = false,
}: ServerDetailHeaderProps) {
  const router = useRouter();

  return (
    <div className="border-b bg-muted/30 px-4 py-2 flex items-center justify-between gap-4">
      <ButtonGroup>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
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
                  onClick={onRefresh}
                  disabled={refreshing}
                  className="w-full justify-start text-xs"
                >
                  <RefreshCw className={`h-3 w-3 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                  {refreshing ? "Actualizando..." : "Actualizar"}
                </Button>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    window.open(`${COOLIFY_URL}/project/${projectUuid}`, "_blank")
                  }
                  className="w-full justify-start text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Abrir en Coolify
                </Button>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </ButtonGroup>

      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          window.open(`${COOLIFY_URL}/project/${projectUuid}`, "_blank")
        }
      >
        <ExternalLink className="h-4 w-4 mr-2" />
        Abrir en Coolify
      </Button>
    </div>
  );
}
