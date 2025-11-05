import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";

function ResponsiveTable() {
  return (
    <div>
      <div className="overflow-x-auto rounded shadow border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 dark:bg-gray-800 text-base">
              <TableHead className="font-semibold text-primary">
                Direction
              </TableHead>
              <TableHead className="font-semibold text-primary">From</TableHead>
              <TableHead className="font-semibold text-primary">To</TableHead>
              <TableHead className="font-semibold text-primary">
                Amount
              </TableHead>
              <TableHead className="font-semibold text-primary">
                Tx Hash
              </TableHead>
               <TableHead className="font-semibold text-primary">
                Amount
              </TableHead>
              <TableHead className="font-semibold text-primary">
                Tx Hash
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              <TableCell className="font-medium">direction</TableCell>
              <TableCell className="font-mono text-sm">to</TableCell>
              <TableCell className="font-medium">direction</TableCell>
              <TableCell className="font-mono text-sm">to</TableCell>
              <TableCell className="font-mono text-sm">from</TableCell>
              <TableCell className="text-blue-700 font-semibold">
                hash
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default ResponsiveTable;
