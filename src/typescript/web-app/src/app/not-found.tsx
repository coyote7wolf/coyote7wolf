import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <h2 className="text-2xl font-semibold text-muted-foreground">
            頁面不存在
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            抱歉，您訪問的頁面不存在或已被移動。
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button>返回首頁</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">前往儀表板</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
