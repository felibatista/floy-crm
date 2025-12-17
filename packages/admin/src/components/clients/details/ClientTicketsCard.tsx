import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from "lucide-react";
import { TicketItem } from "./types";

interface ClientTicketsCardProps {
  tickets: TicketItem[];
}

const ClientTicketsCard = ({ tickets }: ClientTicketsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-4 w-4" />
          Últimos tickets ({tickets.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sin tickets</p>
        ) : (
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-2 rounded-md border text-xs"
              >
                <span className="font-medium truncate">{ticket.title}</span>
                {ticket.status}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientTicketsCard;
