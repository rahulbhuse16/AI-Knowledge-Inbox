import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { AddKnowledgeModal } from "../components/knowledge/AddKnowledgeModal";
import { KnowledgeList } from "../components/knowledge/KnowledgeList";
import { QueryPanel } from "../components/query/QueryPanel";
import { getItems } from "../api/knowledgeApi";
import type { KnowledgeItem, SourceType } from "../types/knowledge";
function MainPage() {
  const [showAddModal, setShowAddModal] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const [items, setItems] = useState<KnowledgeItem[]>(
    [],
  );

  const [source,setSource]=useState<SourceType>('all');

  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getItems();
      setItems(data);
    } catch (error) {
      console.error(
        "Failed to load knowledge:",
        error,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar
        onAddClick={() => setShowAddModal(true)}
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        onSelect={setSource}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onMenuClick={() =>
            setMobileSidebarOpen(true)
          }
        />

        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 sm:mb-10">
              <p className="mb-2 text-sm font-medium text-zinc-500">
                Welcome back
              </p>

              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                What do you want to remember?
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                Save notes, webpages, and useful
                information. Ask questions later and let
                AI find the relevant knowledge for you.
              </p>
            </div>

            <QueryPanel />

            <KnowledgeList
              items={items}
              loading={loading}
              onRefresh={loadItems}
              source={source as any}
            />
          </div>
        </main>
      </div>

      {showAddModal && (
        <AddKnowledgeModal
          onClose={() => setShowAddModal(false)}
          onCreated={loadItems}
        />
      )}
    </div>
  );
}

export default MainPage;
