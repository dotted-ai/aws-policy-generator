"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Download, Plus, Trash2, AlertCircle, CheckCircle, Code, Settings, Upload } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Footer from "@/components/footer"

interface PolicyStatement {
  id: string
  effect: "Allow" | "Deny"
  actions: string[]
  resources: string[]
  conditions?: Record<string, any>
}

interface PolicyDocument {
  Version: string
  Statement: Omit<PolicyStatement, "id">[]
}

const AWS_SERVICES = {
  s3: {
    name: "Amazon S3",
    actions: [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
      "s3:GetBucketLocation",
      "s3:GetBucketVersioning",
      "s3:PutBucketVersioning",
      "s3:GetBucketAcl",
      "s3:PutBucketAcl",
    ],
  },
  dynamodb: {
    name: "Amazon DynamoDB",
    actions: [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
      "dynamodb:Query",
      "dynamodb:Scan",
      "dynamodb:BatchGetItem",
      "dynamodb:BatchWriteItem",
      "dynamodb:DescribeTable",
    ],
  },
  ec2: {
    name: "Amazon EC2",
    actions: [
      "ec2:DescribeInstances",
      "ec2:StartInstances",
      "ec2:StopInstances",
      "ec2:RebootInstances",
      "ec2:TerminateInstances",
      "ec2:CreateTags",
      "ec2:DescribeTags",
      "ec2:RunInstances",
      "ec2:DescribeImages",
    ],
  },
  lambda: {
    name: "AWS Lambda",
    actions: [
      "lambda:InvokeFunction",
      "lambda:CreateFunction",
      "lambda:UpdateFunctionCode",
      "lambda:UpdateFunctionConfiguration",
      "lambda:DeleteFunction",
      "lambda:GetFunction",
      "lambda:ListFunctions",
      "lambda:PublishVersion",
    ],
  },
  iam: {
    name: "AWS IAM",
    actions: [
      "iam:GetUser",
      "iam:CreateUser",
      "iam:DeleteUser",
      "iam:AttachUserPolicy",
      "iam:DetachUserPolicy",
      "iam:ListUsers",
      "iam:CreateRole",
      "iam:DeleteRole",
      "iam:AssumeRole",
    ],
  },
}

const POLICY_TEMPLATES = {
  s3ReadOnly: {
    name: "S3 Read-Only Access",
    description: "Grants read-only access to a specific S3 bucket",
    statement: {
      effect: "Allow" as const,
      actions: ["s3:GetObject", "s3:ListBucket"],
      resources: ["arn:aws:s3:::your-bucket-name/*", "arn:aws:s3:::your-bucket-name"],
    },
  },
  s3FullAccess: {
    name: "S3 Full Access",
    description: "Grants full access to a specific S3 bucket",
    statement: {
      effect: "Allow" as const,
      actions: ["s3:*"],
      resources: ["arn:aws:s3:::your-bucket-name/*", "arn:aws:s3:::your-bucket-name"],
    },
  },
  dynamodbReadWrite: {
    name: "DynamoDB Read/Write",
    description: "Grants read and write access to a DynamoDB table",
    statement: {
      effect: "Allow" as const,
      actions: [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan",
      ],
      resources: ["arn:aws:dynamodb:region:account-id:table/your-table-name"],
    },
  },
  ec2BasicAccess: {
    name: "EC2 Basic Access",
    description: "Grants basic EC2 instance management permissions",
    statement: {
      effect: "Allow" as const,
      actions: ["ec2:DescribeInstances", "ec2:StartInstances", "ec2:StopInstances", "ec2:RebootInstances"],
      resources: ["*"],
    },
  },
}

export default function AWSPolicyGenerator() {
  const [statements, setStatements] = useState<PolicyStatement[]>([
    {
      id: "1",
      effect: "Allow",
      actions: [],
      resources: [],
    },
  ])
  const [selectedService, setSelectedService] = useState<string>("")
  const [customAction, setCustomAction] = useState("")
  const [customResource, setCustomResource] = useState("")
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [jsonInput, setJsonInput] = useState("")
  const [jsonErrors, setJsonErrors] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("visual")
  const [isUploading, setIsUploading] = useState(false)

  const generatePolicy = (): PolicyDocument => {
    return {
      Version: "2012-10-17",
      Statement: statements.map(({ id, ...statement }) => statement),
    }
  }

  const validatePolicy = (policy: PolicyDocument): string[] => {
    const errors: string[] = []

    if (!policy.Statement || policy.Statement.length === 0) {
      errors.push("Policy must contain at least one statement")
    }

    policy.Statement.forEach((statement, index) => {
      if (!statement.actions || statement.actions.length === 0) {
        errors.push(`Statement ${index + 1}: Must specify at least one action`)
      }

      if (!statement.resources || statement.resources.length === 0) {
        errors.push(`Statement ${index + 1}: Must specify at least one resource`)
      }

      statement.actions.forEach((action) => {
        if (!action.includes(":")) {
          errors.push(`Statement ${index + 1}: Invalid action format "${action}". Should be "service:action"`)
        }
      })

      statement.resources.forEach((resource) => {
        if (!resource.startsWith("arn:") && resource !== "*") {
          errors.push(`Statement ${index + 1}: Invalid resource format "${resource}". Should be ARN or "*"`)
        }
      })
    })

    return errors
  }

  useEffect(() => {
    const policy = generatePolicy()
    const errors = validatePolicy(policy)
    setValidationErrors(errors)

    // Update JSON input when statements change (only if we're not currently editing JSON)
    if (activeTab === "visual") {
      setJsonInput(JSON.stringify(policy, null, 2))
    }
  }, [statements, activeTab])

  const parseJsonPolicy = (jsonString: string): { policy: PolicyDocument | null; errors: string[] } => {
    const errors: string[] = []

    if (!jsonString.trim()) {
      return { policy: null, errors: ["JSON input is empty"] }
    }

    try {
      const parsed = JSON.parse(jsonString)

      // Basic structure validation
      if (!parsed.Version) {
        errors.push("Missing 'Version' field")
      } else if (parsed.Version !== "2012-10-17") {
        errors.push("Version should be '2012-10-17' for current AWS policy language")
      }

      if (!parsed.Statement) {
        errors.push("Missing 'Statement' field")
      } else if (!Array.isArray(parsed.Statement)) {
        errors.push("'Statement' must be an array")
      } else {
        // Validate each statement
        parsed.Statement.forEach((stmt: any, index: number) => {
          if (!stmt.Effect || (stmt.Effect !== "Allow" && stmt.Effect !== "Deny")) {
            errors.push(`Statement ${index + 1}: Effect must be 'Allow' or 'Deny'`)
          }

          if (!stmt.Action && !stmt.NotAction) {
            errors.push(`Statement ${index + 1}: Must specify 'Action' or 'NotAction'`)
          }

          if (!stmt.Resource && !stmt.NotResource) {
            errors.push(`Statement ${index + 1}: Must specify 'Resource' or 'NotResource'`)
          }
        })
      }

      if (errors.length === 0) {
        // Normalize the policy format
        const normalizedPolicy: PolicyDocument = {
          Version: parsed.Version,
          Statement: parsed.Statement.map((stmt: any) => ({
            effect: stmt.Effect,
            actions: Array.isArray(stmt.Action) ? stmt.Action : (stmt.Action ? [stmt.Action] : []),
            resources: Array.isArray(stmt.Resource) ? stmt.Resource : (stmt.Resource ? [stmt.Resource] : []),
            conditions: stmt.Condition,
          }))
        }
        return { policy: normalizedPolicy, errors: [] }
      }

      return { policy: null, errors }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Invalid JSON format"
      return { policy: null, errors: [`JSON Parse Error: ${errorMessage}`] }
    }
  }

  const applyJsonPolicy = () => {
    const { policy, errors } = parseJsonPolicy(jsonInput)

    if (errors.length > 0) {
      setJsonErrors(errors)
      return
    }

    if (policy) {
      // Convert policy statements to internal format
      const newStatements: PolicyStatement[] = policy.Statement.map((stmt, index) => ({
        id: Date.now().toString() + index,
        effect: stmt.effect,
        actions: stmt.actions || [],
        resources: stmt.resources || [],
        conditions: stmt.conditions,
      }))

      setStatements(newStatements)
      setJsonErrors([])
      setActiveTab("visual")

      toast({
        title: "Policy Applied",
        description: "JSON policy has been successfully applied to the visual editor.",
      })
    }
  }

  const addStatement = () => {
    const newStatement: PolicyStatement = {
      id: Date.now().toString(),
      effect: "Allow",
      actions: [],
      resources: [],
    }
    setStatements([...statements, newStatement])
  }

  const removeStatement = (id: string) => {
    setStatements(statements.filter((s) => s.id !== id))
  }

  const updateStatement = (id: string, updates: Partial<PolicyStatement>) => {
    setStatements(statements.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const addActionToStatement = (statementId: string, action: string) => {
    const statement = statements.find((s) => s.id === statementId)
    if (statement && !statement.actions.includes(action)) {
      updateStatement(statementId, {
        actions: [...statement.actions, action],
      })
    }
  }

  const removeActionFromStatement = (statementId: string, action: string) => {
    const statement = statements.find((s) => s.id === statementId)
    if (statement) {
      updateStatement(statementId, {
        actions: statement.actions.filter((a) => a !== action),
      })
    }
  }

  const addResourceToStatement = (statementId: string, resource: string) => {
    const statement = statements.find((s) => s.id === statementId)
    if (statement && !statement.resources.includes(resource)) {
      updateStatement(statementId, {
        resources: [...statement.resources, resource],
      })
    }
  }

  const removeResourceFromStatement = (statementId: string, resource: string) => {
    const statement = statements.find((s) => s.id === statementId)
    if (statement) {
      updateStatement(statementId, {
        resources: statement.resources.filter((r) => r !== resource),
      })
    }
  }

  const applyTemplate = (templateKey: string) => {
    const template = POLICY_TEMPLATES[templateKey as keyof typeof POLICY_TEMPLATES]
    if (template) {
      const newStatement: PolicyStatement = {
        id: Date.now().toString(),
        ...template.statement,
      }
      setStatements([...statements, newStatement])
      toast({
        title: "Template Applied",
        description: `${template.name} template has been added to your policy.`,
      })
    }
  }

  const copyToClipboard = () => {
    const policy = generatePolicy()
    navigator.clipboard.writeText(JSON.stringify(policy, null, 2))
    toast({
      title: "Copied to Clipboard",
      description: "Policy JSON has been copied to your clipboard.",
    })
  }

  const downloadPolicy = () => {
    const policy = generatePolicy()
    const blob = new Blob([JSON.stringify(policy, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "aws-policy.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: "Policy Downloaded",
      description: "Policy JSON has been downloaded as aws-policy.json.",
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JSON file.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        setJsonInput(content)
        setJsonErrors([])

        // Auto-apply the uploaded JSON
        const { policy, errors } = parseJsonPolicy(content)

        if (errors.length > 0) {
          setJsonErrors(errors)
          toast({
            title: "Upload Complete with Errors",
            description: "File uploaded but contains validation errors. Please review and fix them.",
            variant: "destructive",
          })
        } else if (policy) {
          // Convert policy statements to internal format
          const newStatements: PolicyStatement[] = policy.Statement.map((stmt, index) => ({
            id: Date.now().toString() + index,
            effect: stmt.effect,
            actions: stmt.actions || [],
            resources: stmt.resources || [],
            conditions: stmt.conditions,
          }))

          setStatements(newStatements)
          setActiveTab("visual")

          toast({
            title: "Policy Uploaded Successfully",
            description: "JSON policy has been uploaded and applied to the visual editor.",
          })
        }
      } catch (error) {
        toast({
          title: "Upload Error",
          description: "Failed to read the uploaded file.",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
        // Reset the input so the same file can be uploaded again
        event.target.value = ""
      }
    }

    reader.onerror = () => {
      toast({
        title: "Upload Error",
        description: "Failed to read the uploaded file.",
        variant: "destructive",
      })
      setIsUploading(false)
    }

    reader.readAsText(file)
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl bg-gray-50 min-h-screen">
      <div className="mb-8 bg-primary text-primary-foreground p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">AWS IAM Policy Generator</h1>
        <p className="text-primary-foreground/80">
          Create and customize AWS IAM policies with an intuitive interface. Build policies by selecting services,
          actions, and resources.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Policy Builder */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={(value) => {
            if (value === "json" && activeTab === "visual") {
              // Sync current policy to JSON when switching to JSON mode
              const policy = generatePolicy()
              setJsonInput(JSON.stringify(policy, null, 2))
            }
            setActiveTab(value)
          }} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="visual" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Visual Builder
              </TabsTrigger>
              <TabsTrigger value="json" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                JSON Editor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="visual" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Policy Statements
                    <Button
                      onClick={addStatement}
                      size="sm"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Statement
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {statements.map((statement, index) => (
                        <Card key={statement.id} className="border-2 border-primary/20">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">Statement {index + 1}</h4>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={statement.effect}
                                  onValueChange={(value: "Allow" | "Deny") =>
                                    updateStatement(statement.id, { effect: value })
                                  }
                                >
                                  <SelectTrigger className="w-24 border-primary/30">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Allow">Allow</SelectItem>
                                    <SelectItem value="Deny">Deny</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeStatement(statement.id)}
                                  disabled={statements.length === 1}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Actions */}
                            <div>
                              <Label className="text-sm font-medium">Actions</Label>
                              <div className="flex gap-2 mt-2">
                                <Select value={selectedService} onValueChange={setSelectedService}>
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select AWS Service" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(AWS_SERVICES).map(([key, service]) => (
                                      <SelectItem key={key} value={key}>
                                        {service.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {selectedService && (
                                <div className="mt-2">
                                  <Label className="text-xs text-muted-foreground">Available Actions</Label>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {AWS_SERVICES[selectedService as keyof typeof AWS_SERVICES].actions.map((action) => (
                                      <Button
                                        key={action}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-7 border-accent/30 hover:bg-accent hover:text-accent-foreground bg-transparent"
                                        onClick={() => addActionToStatement(statement.id, action)}
                                      >
                                        {action}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-2 mt-2">
                                <Input
                                  placeholder="Custom action (e.g., s3:GetObject)"
                                  value={customAction}
                                  onChange={(e) => setCustomAction(e.target.value)}
                                  className="flex-1"
                                />
                                <Button
                                  onClick={() => {
                                    if (customAction) {
                                      addActionToStatement(statement.id, customAction)
                                      setCustomAction("")
                                    }
                                  }}
                                  size="sm"
                                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                                >
                                  Add
                                </Button>
                              </div>

                              <div className="flex flex-wrap gap-1 mt-2">
                                {statement.actions.map((action) => (
                                  <Badge
                                    key={action}
                                    variant="secondary"
                                    className="text-xs bg-primary/10 text-primary border-primary/20"
                                  >
                                    {action}
                                    <button
                                      onClick={() => removeActionFromStatement(statement.id, action)}
                                      className="ml-1 hover:text-accent"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <Separator />

                            {/* Resources */}
                            <div>
                              <Label className="text-sm font-medium">Resources</Label>
                              <div className="flex gap-2 mt-2">
                                <Input
                                  placeholder="Resource ARN or * (e.g., arn:aws:s3:::bucket-name/*)"
                                  value={customResource}
                                  onChange={(e) => setCustomResource(e.target.value)}
                                  className="flex-1"
                                />
                                <Button
                                  onClick={() => {
                                    if (customResource) {
                                      addResourceToStatement(statement.id, customResource)
                                      setCustomResource("")
                                    }
                                  }}
                                  size="sm"
                                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                                >
                                  Add
                                </Button>
                              </div>

                              <div className="flex flex-wrap gap-1 mt-2">
                                {statement.resources.map((resource) => (
                                  <Badge
                                    key={resource}
                                    variant="secondary"
                                    className="text-xs bg-primary/10 text-primary border-primary/20"
                                  >
                                    {resource}
                                    <button
                                      onClick={() => removeResourceFromStatement(statement.id, resource)}
                                      className="ml-1 hover:text-accent"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Templates */}
              <Card>
                <CardHeader>
                  <CardTitle>Policy Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(POLICY_TEMPLATES).map(([key, template]) => (
                      <div key={key} className="border rounded-lg p-3">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full border-accent/30 hover:bg-accent hover:text-accent-foreground bg-transparent"
                          onClick={() => applyTemplate(key)}
                        >
                          Apply Template
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="json" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    JSON Policy Editor
                    <div className="flex gap-2">
                      <div className="relative">
                        <input
                          type="file"
                          accept=".json,application/json"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={isUploading}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUploading}
                          className="border-accent/30 hover:bg-accent hover:text-accent-foreground bg-transparent"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {isUploading ? "Uploading..." : "Upload JSON"}
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setJsonInput("")
                          setJsonErrors([])
                        }}
                        className="border-accent/30 hover:bg-accent hover:text-accent-foreground bg-transparent"
                      >
                        Clear
                      </Button>
                      <Button
                        onClick={applyJsonPolicy}
                        size="sm"
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        Apply JSON
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {jsonErrors.length > 0 && (
                    <Alert className="mb-4 border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription>
                        <div className="font-medium mb-2 text-red-800">JSON Validation Errors:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {jsonErrors.map((error, index) => (
                            <li key={index} className="text-sm text-red-700">
                              {error}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Policy JSON</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          try {
                            const parsed = JSON.parse(jsonInput)
                            setJsonInput(JSON.stringify(parsed, null, 2))
                            toast({
                              title: "JSON Formatted",
                              description: "JSON has been formatted successfully.",
                            })
                          } catch (e) {
                            toast({
                              title: "Format Error",
                              description: "Invalid JSON format. Please check your syntax.",
                              variant: "destructive",
                            })
                          }
                        }}
                        className="border-accent/30 hover:bg-accent hover:text-accent-foreground bg-transparent"
                      >
                        Format JSON
                      </Button>
                    </div>
                    <Textarea
                      value={jsonInput}
                      onChange={(e) => {
                        setJsonInput(e.target.value)
                        setJsonErrors([]) // Clear errors when user starts typing
                      }}
                      placeholder="Paste or edit your IAM policy JSON here..."
                      className="font-mono text-sm h-[500px] resize-none"
                    />
                  </div>

                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Tip:</strong> You can upload a JSON file using the "Upload JSON" button, paste an existing IAM policy JSON here, or manually edit the JSON and apply your changes to load it into the visual builder.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Policy Output */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  Generated Policy
                  <Badge variant="outline" className="text-xs">
                    {activeTab === "visual" ? "Visual Mode" : "JSON Mode"}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="border-accent/30 hover:bg-accent hover:text-accent-foreground bg-transparent"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadPolicy}
                    className="border-accent/30 hover:bg-accent hover:text-accent-foreground bg-transparent"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {validationErrors.length > 0 && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <div className="font-medium mb-2 text-red-800">Policy Validation Errors:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="text-sm text-red-700">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validationErrors.length === 0 && (
                <Alert className="mb-4 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">Policy is valid and ready to use.</AlertDescription>
                </Alert>
              )}

              <Textarea
                value={JSON.stringify(generatePolicy(), null, 2)}
                readOnly
                className="font-mono text-sm h-[500px] resize-none bg-primary/5 border-primary/20"
              />
            </CardContent>
          </Card>

          {/* Policy Information */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Policy Version</Label>
                <p className="text-sm text-muted-foreground">2012-10-17 (Current AWS policy language version)</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Statements Count</Label>
                <p className="text-sm text-muted-foreground">
                  {statements.length} statement{statements.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Total Actions</Label>
                <p className="text-sm text-muted-foreground">
                  {statements.reduce((total, statement) => total + statement.actions.length, 0)} action
                  {statements.reduce((total, statement) => total + statement.actions.length, 0) !== 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Total Resources</Label>
                <p className="text-sm text-muted-foreground">
                  {statements.reduce((total, statement) => total + statement.resources.length, 0)} resource
                  {statements.reduce((total, statement) => total + statement.resources.length, 0) !== 1 ? "s" : ""}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
