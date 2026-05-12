"use client";

import { useState } from "react";
import { parseScript } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

function ParsePage() {
  const [bytecode, setBytecode] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleParse = () => {
    if (bytecode.trim()) {
      const parsed = parseScript(bytecode.trim());
      setResult(parsed);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Bytecode Parser</h1>
        <ThemeToggle />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parse Script</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="bytecode"
                className="mb-2 block text-sm font-medium text-muted-foreground"
              >
                Bytecode
              </label>
              <Input
                id="bytecode"
                type="text"
                value={bytecode}
                onChange={(e) => setBytecode(e.target.value)}
                placeholder="Enter bytecode (e.g., 76a914...88ac)"
              />
            </div>

            <Button onClick={handleParse} disabled={!bytecode.trim()}>
              Parse
            </Button>

            {result && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Parsed Script</h2>
                <pre className="overflow-x-auto whitespace-pre-wrap rounded border bg-muted p-4 font-mono text-sm">
                  {result}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ParsePage;
