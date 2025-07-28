import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function Footer() {
  return (
    <footer className="mt-12 border-t bg-background">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <Card className="p-6 bg-muted/30 border-muted">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              AWS IAM Policy Generator
            </h3>
            <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A web application that provides an intuitive interface for creating and customizing AWS IAM policies. 
              Build IAM policies by selecting AWS services, actions, and resources through a visual interface rather 
              than writing JSON manually. Perfect for AWS developers, DevOps engineers, and security professionals 
              working with IAM policies.
            </p>
            <Separator className="my-4" />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>✨ Visual Policy Builder</span>
                <span>📋 Pre-built Templates</span>
                <span>✅ Real-time Validation</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground/80 mt-4">
              Built with Next.js, React, and Tailwind CSS
            </p>
          </div>
        </Card>
        
        {/* Dotted AI Credit */}
        <div className="text-center mt-6 pb-4">
          <p className="text-xs text-muted-foreground/60">
            feito com 🧡 por{" "}
            <a 
              href="https://www.usedotted.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-orange-500 transition-colors underline decoration-dotted"
            >
              Dotted AI
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}