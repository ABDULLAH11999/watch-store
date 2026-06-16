import { DbBackupPanel } from "@/components/admin/db-backup-panel";

export const dynamic = "force-dynamic";

export default function BackupDatabasePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-black/45">Backup</p>
        <h1 className="mt-2 font-heading text-5xl">Backup Database</h1>
      </div>
      <DbBackupPanel />
    </div>
  );
}
