import { AppShell } from "@/components/shell/app-shell";
import { PageContainer } from "@/components/shell/page-container";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState, LoadingState } from "@/components/ui/state";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/form";
import { Grid, Stack } from "@/components/ui/layout";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { navigationItems } from "@/config/navigation";

export default function HomePage() {
  return (
    <AppShell>
      <PageContainer>
        <Card>
          <CardHeader>
            <Badge>Foundation</Badge>
            <CardTitle>fake-shop workspace</CardTitle>
            <CardDescription>
              The shell is ready to host future product areas. This page is a foundation surface
              only and does not include business features.
            </CardDescription>
          </CardHeader>
        </Card>

        <Grid>
          {navigationItems.map((item) => (
            <Card id={item.href.slice(1)} key={item.href}>
              <CardHeader>
                <CardTitle>{item.label}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </Grid>

        <Card>
          <CardHeader>
            <CardTitle>UI foundation</CardTitle>
            <CardDescription>
              Generic primitives for future screens. These examples do not represent application
              data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Grid>
              <Stack>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="foundation-input">Input</FieldLabel>
                    <Input id="foundation-input" placeholder="Generic text input" />
                    <FieldDescription>Reusable text field styling.</FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="foundation-select">Select</FieldLabel>
                    <Select defaultValue="one" id="foundation-select">
                      <option value="one">Option one</option>
                      <option value="two">Option two</option>
                    </Select>
                  </Field>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox />
                    Checkbox
                  </label>
                  <div className="flex items-center gap-2 text-sm">
                    <Switch checked />
                    Switch
                  </div>
                </FieldGroup>
              </Stack>

              <Stack>
                <Alert variant="info">Generic alert for neutral interface feedback.</Alert>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone="neutral">Neutral</StatusBadge>
                  <StatusBadge tone="success">Success</StatusBadge>
                  <StatusBadge tone="warning">Warning</StatusBadge>
                  <StatusBadge tone="danger">Danger</StatusBadge>
                </div>
                <LoadingState title="Loading state" />
              </Stack>

              <EmptyState
                description="Reusable empty state for future screens."
                title="Empty state"
              />
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Table foundation</CardTitle>
            <CardDescription>Generic table structure for future data views.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead>Responsibility</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Card</TableCell>
                  <TableCell>Surface container</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Presentation-only state display</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </PageContainer>
    </AppShell>
  );
}
