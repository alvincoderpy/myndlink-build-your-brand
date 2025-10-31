import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Eye } from "lucide-react";

const StoreEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<any>(null);
  const [storeName, setStoreName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [template, setTemplate] = useState("fashion");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadStore();
  }, []);

  const loadStore = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setStore(data);
        setStoreName(data.name);
        setSubdomain(data.subdomain);
        setTemplate(data.template);
      }
    } catch (error: any) {
      console.error("Error loading store:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "");
      
      if (!cleanSubdomain || cleanSubdomain.length < 3) {
        toast({
          title: "Erro",
          description: "Subdomínio deve ter pelo menos 3 caracteres",
          variant: "destructive",
        });
        return;
      }

      if (store) {
        const { error } = await supabase
          .from("stores")
          .update({
            name: storeName,
            subdomain: cleanSubdomain,
            template,
          })
          .eq("id", store.id);

        if (error) throw error;

        toast({
          title: "Loja atualizada!",
          description: "As tuas alterações foram guardadas.",
        });
      } else {
        const { error } = await supabase
          .from("stores")
          .insert({
            user_id: user.id,
            name: storeName,
            subdomain: cleanSubdomain,
            template,
            plan: "free",
          });

        if (error) {
          if (error.code === "23505") {
            toast({
              title: "Erro",
              description: "Este subdomínio já está em uso. Escolhe outro.",
              variant: "destructive",
            });
            return;
          }
          throw error;
        }

        toast({
          title: "Loja criada!",
          description: "A tua loja foi criada com sucesso.",
        });
      }

      await loadStore();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao guardar a loja.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return loading ? (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    </div>
  ) : (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {store ? "Minha Loja" : "Criar Loja"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {store ? "Personaliza a tua loja online" : "Configura a tua nova loja"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {store && (
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Ver Loja
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl">

          <div className="space-y-8">
            {/* Basic Info */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Informações Básicas</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Loja</Label>
                  <Input
                    id="name"
                    placeholder="Minha Loja Incrível"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="subdomain">Subdomínio</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="subdomain"
                      placeholder="minhaloja"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">.myndlink.com</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Apenas letras minúsculas, números e hífens
                  </p>
                </div>
              </div>
            </Card>

            {/* Template Selection */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Escolher Template</h2>
              <div>
                <Label htmlFor="template">Template</Label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Escolher template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fashion">Moda</SelectItem>
                    <SelectItem value="electronics">Eletrônicos</SelectItem>
                    <SelectItem value="beauty">Beleza</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-6">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pré-visualização do template: <strong>{template}</strong>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    (Pré-visualização disponível em breve)
                  </p>
                </div>
              </div>
            </Card>

          </div>
      </div>
    </>
  );
};

export default StoreEditor;
