import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Constants, Tables, TablesInsert } from "@/integrations/supabase/types";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ArrowLeft, Save, Send, Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type InsuranceProduct = Tables<"insurance_products">;

const ProductCreate = () => {
  const { productId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [partnerId, setPartnerId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("basics");
  const [generatingAI, setGeneratingAI] = useState(false);

  const [formData, setFormData] = useState<Partial<TablesInsert<"insurance_products">>>({
    product_name: "",
    insurance_type: "health",
    short_summary: "",
    full_description: "",
    target_users: "",
    region_country: "",
    premium_start_price: 0,
    currency: "GBP",
    coverage_limits: {},
    excess_deductibles: {},
    add_ons: {},
    exclusions_list: [],
    key_benefits: [],
    status: "draft",
  });

  const [coverageLimits, setCoverageLimits] = useState<{ key: string; value: string }[]>([
    { key: "", value: "" },
  ]);
  const [excessDeductibles, setExcessDeductibles] = useState<{ key: string; value: string }[]>([
    { key: "", value: "" },
  ]);
  const [addOns, setAddOns] = useState<{ name: string; price: string }[]>([{ name: "", price: "" }]);
  const [exclusions, setExclusions] = useState<string[]>([""]);
  const [benefits, setBenefits] = useState<string[]>([""]);

  useEffect(() => {
    fetchPartnerProfile();
    if (productId) {
      fetchProduct();
    }
  }, [user, productId]);

  const fetchPartnerProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("insurance_partners")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;
      setPartnerId(data.id);
    } catch (error: any) {
      console.error("Error fetching partner profile:", error);
      toast({
        title: "Error",
        description: "Failed to load partner profile",
        variant: "destructive",
      });
      navigate("/partner/setup");
    }
  };

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("insurance_products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) throw error;

      setFormData(data);

      // Parse JSON fields
      if (data.coverage_limits) {
        const limits = Object.entries(data.coverage_limits as Record<string, string>).map(
          ([key, value]) => ({ key, value: String(value) })
        );
        setCoverageLimits(limits.length > 0 ? limits : [{ key: "", value: "" }]);
      }

      if (data.excess_deductibles) {
        const excess = Object.entries(data.excess_deductibles as Record<string, string>).map(
          ([key, value]) => ({ key, value: String(value) })
        );
        setExcessDeductibles(excess.length > 0 ? excess : [{ key: "", value: "" }]);
      }

      if (data.add_ons) {
        const addOnsData = Object.entries(data.add_ons as Record<string, string>).map(
          ([name, price]) => ({ name, price: String(price) })
        );
        setAddOns(addOnsData.length > 0 ? addOnsData : [{ name: "", price: "" }]);
      }

      if (data.exclusions_list) {
        setExclusions(data.exclusions_list.length > 0 ? data.exclusions_list : [""]);
      }

      if (data.key_benefits) {
        setBenefits(data.key_benefits.length > 0 ? data.key_benefits : [""]);
      }
    } catch (error: any) {
      console.error("Error fetching product:", error);
      toast({
        title: "Error",
        description: "Failed to load product",
        variant: "destructive",
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayChange = (
    index: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleObjectArrayChange = <T extends { [key: string]: string }>(
    index: number,
    field: keyof T,
    value: string,
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, ""]);
  };

  const addObjectArrayItem = <T extends object>(
    defaultValue: T,
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    setter((prev) => [...prev, defaultValue]);
  };

  const removeArrayItem = (
    index: number,
    setter: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const generateAIContent = async () => {
    setGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-product-content", {
        body: {
          productName: formData.product_name,
          insuranceType: formData.insurance_type,
          shortSummary: formData.short_summary,
        },
      });

      if (error) throw error;

      setFormData((prev) => ({
        ...prev,
        ai_generated_description: data.description,
        ai_generated_marketing_copy: data.marketingCopy,
        ai_generated_faq: data.faq,
      }));

      if (data.exclusions && Array.isArray(data.exclusions)) {
        setExclusions(data.exclusions);
      }

      toast({
        title: "AI Content Generated!",
        description: "Review and edit the generated content as needed",
      });
    } catch (error: any) {
      console.error("Error generating AI content:", error);
      toast({
        title: "Error",
        description: "Failed to generate AI content",
        variant: "destructive",
      });
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (submitForReview: boolean = false) => {
    setLoading(true);

    try {
      // Prepare data
      const productData: Partial<TablesInsert<"insurance_products">> = {
        ...formData,
        partner_id: partnerId,
        coverage_limits: Object.fromEntries(
          coverageLimits.filter((item) => item.key && item.value).map((item) => [item.key, item.value])
        ),
        excess_deductibles: Object.fromEntries(
          excessDeductibles.filter((item) => item.key && item.value).map((item) => [item.key, item.value])
        ),
        add_ons: Object.fromEntries(
          addOns.filter((item) => item.name && item.price).map((item) => [item.name, item.price])
        ),
        exclusions_list: exclusions.filter((item) => item.trim() !== ""),
        key_benefits: benefits.filter((item) => item.trim() !== ""),
        status: submitForReview ? "pending_review" : "draft",
      };

      if (productId) {
        // Update existing product
        const { error } = await supabase
          .from("insurance_products")
          .update(productData)
          .eq("id", productId);

        if (error) throw error;
      } else {
        // Create new product
        const { error } = await supabase
          .from("insurance_products")
          .insert(productData);

        if (error) throw error;
      }

      toast({
        title: "Success!",
        description: submitForReview
          ? "Product submitted for review"
          : productId
          ? "Product updated successfully"
          : "Product created successfully",
      });

      navigate("/partner/dashboard");
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <DashboardHeader />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/partner/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {productId ? "Edit Product" : "Create New Product"}
          </h1>
          <p className="mt-1 text-gray-600">
            Fill in the details below to create your insurance product
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="coverage">Coverage</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="ai">AI Content</TabsTrigger>
          </TabsList>

          {/* Product Basics Tab */}
          <TabsContent value="basics">
            <Card className="p-6">
              <h2 className="mb-6 text-2xl font-semibold text-gray-900">Product Basics</h2>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="product_name">
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="product_name"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Comprehensive Health Insurance"
                  />
                </div>

                <div>
                  <Label htmlFor="insurance_type">
                    Insurance Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.insurance_type}
                    onValueChange={(value) => handleSelectChange("insurance_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Constants.public.Enums.insurance_type_enum.map((type) => (
                        <SelectItem key={type} value={type} className="capitalize">
                          {type.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="short_summary">Short Summary</Label>
                  <Textarea
                    id="short_summary"
                    name="short_summary"
                    value={formData.short_summary || ""}
                    onChange={handleChange}
                    rows={2}
                    placeholder="A brief one-line description of your product"
                  />
                </div>

                <div>
                  <Label htmlFor="full_description">Full Description</Label>
                  <Textarea
                    id="full_description"
                    name="full_description"
                    value={formData.full_description || ""}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Detailed description of your insurance product"
                  />
                </div>

                <div>
                  <Label htmlFor="target_users">Target Users</Label>
                  <Input
                    id="target_users"
                    name="target_users"
                    value={formData.target_users || ""}
                    onChange={handleChange}
                    placeholder="e.g., Families, Young professionals, Seniors"
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="region_country">Region/Country of Coverage</Label>
                    <Input
                      id="region_country"
                      name="region_country"
                      value={formData.region_country || ""}
                      onChange={handleChange}
                      placeholder="e.g., United Kingdom, Europe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => handleSelectChange("currency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="NGN">NGN (₦)</SelectItem>
                        <SelectItem value="GHS">GHS (₵)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="premium_start_price">
                    Premium Start Price <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="premium_start_price"
                    name="premium_start_price"
                    type="number"
                    step="0.01"
                    value={formData.premium_start_price}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label>Key Benefits</Label>
                  {benefits.map((benefit, index) => (
                    <div key={index} className="mt-2 flex gap-2">
                      <Input
                        value={benefit}
                        onChange={(e) =>
                          handleArrayChange(index, e.target.value, setBenefits)
                        }
                        placeholder="e.g., 24/7 helpline, No age limit"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeArrayItem(index, setBenefits)}
                        disabled={benefits.length === 1}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem(setBenefits)}
                    className="mt-2"
                  >
                    + Add Benefit
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Coverage Details Tab */}
          <TabsContent value="coverage">
            <Card className="p-6">
              <h2 className="mb-6 text-2xl font-semibold text-gray-900">Coverage Details</h2>
              <div className="space-y-6">
                <div>
                  <Label>Coverage Limits</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Define the maximum coverage amounts for different categories
                  </p>
                  {coverageLimits.map((limit, index) => (
                    <div key={index} className="mt-2 flex gap-2">
                      <Input
                        value={limit.key}
                        onChange={(e) =>
                          handleObjectArrayChange(index, "key", e.target.value, setCoverageLimits)
                        }
                        placeholder="Category (e.g., Medical expenses)"
                        className="flex-1"
                      />
                      <Input
                        value={limit.value}
                        onChange={(e) =>
                          handleObjectArrayChange(index, "value", e.target.value, setCoverageLimits)
                        }
                        placeholder="Limit (e.g., £500,000)"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeArrayItem(index, setCoverageLimits)}
                        disabled={coverageLimits.length === 1}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addObjectArrayItem({ key: "", value: "" }, setCoverageLimits)}
                    className="mt-2"
                  >
                    + Add Coverage Limit
                  </Button>
                </div>

                <div>
                  <Label>Excess / Deductibles</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Define the deductible amounts for different scenarios
                  </p>
                  {excessDeductibles.map((excess, index) => (
                    <div key={index} className="mt-2 flex gap-2">
                      <Input
                        value={excess.key}
                        onChange={(e) =>
                          handleObjectArrayChange(index, "key", e.target.value, setExcessDeductibles)
                        }
                        placeholder="Type (e.g., Standard excess)"
                        className="flex-1"
                      />
                      <Input
                        value={excess.value}
                        onChange={(e) =>
                          handleObjectArrayChange(index, "value", e.target.value, setExcessDeductibles)
                        }
                        placeholder="Amount (e.g., £100)"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeArrayItem(index, setExcessDeductibles)}
                        disabled={excessDeductibles.length === 1}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addObjectArrayItem({ key: "", value: "" }, setExcessDeductibles)}
                    className="mt-2"
                  >
                    + Add Excess/Deductible
                  </Button>
                </div>

                <div>
                  <Label>Add-ons (Optional Coverage)</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Additional coverage options customers can add
                  </p>
                  {addOns.map((addOn, index) => (
                    <div key={index} className="mt-2 flex gap-2">
                      <Input
                        value={addOn.name}
                        onChange={(e) =>
                          handleObjectArrayChange(index, "name", e.target.value, setAddOns)
                        }
                        placeholder="Add-on name (e.g., Roadside assistance)"
                        className="flex-1"
                      />
                      <Input
                        value={addOn.price}
                        onChange={(e) =>
                          handleObjectArrayChange(index, "price", e.target.value, setAddOns)
                        }
                        placeholder="Price (e.g., £50/year)"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeArrayItem(index, setAddOns)}
                        disabled={addOns.length === 1}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addObjectArrayItem({ name: "", price: "" }, setAddOns)}
                    className="mt-2"
                  >
                    + Add Add-on
                  </Button>
                </div>

                <div>
                  <Label>Exclusions List</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    What is NOT covered by this policy
                  </p>
                  {exclusions.map((exclusion, index) => (
                    <div key={index} className="mt-2 flex gap-2">
                      <Input
                        value={exclusion}
                        onChange={(e) =>
                          handleArrayChange(index, e.target.value, setExclusions)
                        }
                        placeholder="e.g., Pre-existing conditions"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeArrayItem(index, setExclusions)}
                        disabled={exclusions.length === 1}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem(setExclusions)}
                    className="mt-2"
                  >
                    + Add Exclusion
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Pricing & Underwriting Tab */}
          <TabsContent value="pricing">
            <Card className="p-6">
              <h2 className="mb-6 text-2xl font-semibold text-gray-900">
                Pricing & Underwriting Rules
              </h2>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                <p className="text-gray-600">
                  Underwriting rules can be configured after creating the product.
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  You'll be able to add custom rules like age limits, vehicle type restrictions, and
                  premium adjustments from the product edit page.
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card className="p-6">
              <h2 className="mb-6 text-2xl font-semibold text-gray-900">Product Documents</h2>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                <p className="text-gray-600">
                  Document uploads (Policy wording, Brochures, T&Cs) can be added after creating the
                  product.
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  You'll be able to upload PDFs and other documents from the product edit page.
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* AI Content Tab */}
          <TabsContent value="ai">
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">AI Enhancements</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Let AI generate compelling content for your product
                  </p>
                </div>
                <Button
                  onClick={generateAIContent}
                  disabled={generatingAI || !formData.product_name}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {generatingAI ? "Generating..." : "Generate AI Content"}
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="ai_generated_description">AI Generated Description</Label>
                  <Textarea
                    id="ai_generated_description"
                    value={formData.ai_generated_description || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ai_generated_description: e.target.value,
                      }))
                    }
                    rows={5}
                    placeholder="AI will generate a compelling product description here..."
                  />
                </div>

                <div>
                  <Label htmlFor="ai_generated_marketing_copy">AI Generated Marketing Copy</Label>
                  <Textarea
                    id="ai_generated_marketing_copy"
                    value={formData.ai_generated_marketing_copy || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ai_generated_marketing_copy: e.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="AI will generate marketing copy here..."
                  />
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <Label>AI Generated FAQ</Label>
                  <p className="text-sm text-gray-600">
                    {formData.ai_generated_faq
                      ? "FAQ content generated successfully. Edit in JSON format if needed."
                      : "FAQ will be generated automatically when you click 'Generate AI Content'"}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/partner/dashboard")}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            <Save className="mr-2 h-4 w-4" />
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit(true)}
            disabled={loading || !formData.product_name}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Send className="mr-2 h-4 w-4" />
            {loading ? "Submitting..." : "Submit for Review"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCreate;
