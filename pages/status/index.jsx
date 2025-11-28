import UpdatedAt from "components/UpdatedAt";
import DatabaseStatus from "components/DatabaseStatus";

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </>
  );
}
