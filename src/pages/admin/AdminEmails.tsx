import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminEmails() {
  const templates = useQuery(api.admin.emailTemplates.listEmailTemplates);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [textBody, setTextBody] = useState("");

  const template = useQuery(
    api.admin.emailTemplates.getEmailTemplate,
    selectedKey ? { key: selectedKey } : "skip",
  );
  const preview = useQuery(
    api.admin.emailTemplates.previewEmailTemplate,
    selectedKey
      ? { key: selectedKey, subject, htmlBody, textBody }
      : "skip",
  );
  const updateTemplate = useMutation(api.admin.emailTemplates.updateEmailTemplate);

  useEffect(() => {
    if (template) {
      setSubject(template.subject);
      setHtmlBody(template.htmlBody);
      setTextBody(template.textBody);
    }
  }, [template]);

  useEffect(() => {
    if (templates?.length && !selectedKey) {
      setSelectedKey(templates[0].key);
    }
  }, [templates, selectedKey]);

  async function save() {
    if (!selectedKey) return;
    await updateTemplate({ key: selectedKey, subject, htmlBody, textBody });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Email templates</h1>
        <p className="mt-2 text-muted-foreground">
          Edit transactional email content. Placeholders:{" "}
          {"{{customerName}} {{serviceName}} {{appointmentDate}} {{appointmentTime}} {{magicLinkUrl}}"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(templates ?? []).map((t) => (
          <Button
            key={t.key}
            variant={selectedKey === t.key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedKey(t.key)}
          >
            {t.key}
          </Button>
        ))}
      </div>

      {selectedKey && template && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Edit {selectedKey}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Subject</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div>
                <Label>HTML body</Label>
                <Textarea
                  value={htmlBody}
                  onChange={(e) => setHtmlBody(e.target.value)}
                  rows={8}
                />
              </div>
              <div>
                <Label>Plain text body</Label>
                <Textarea
                  value={textBody}
                  onChange={(e) => setTextBody(e.target.value)}
                  rows={6}
                />
              </div>
              <Button onClick={() => void save()}>Save template</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {preview && (
                <div className="space-y-3 text-sm">
                  <p>
                    <strong>Subject:</strong> {preview.subject}
                  </p>
                  <div
                    className="rounded border bg-white p-4 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: preview.html }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
