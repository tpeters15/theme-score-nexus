import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { finder } from '@medv/finder';

interface SelectorConfig {
  field: string;
  selector: string;
  attribute?: string; // For extracting href, src, etc.
  sample_value: string;
  element_type: 'text' | 'link' | 'image' | 'date';
}

interface ScraperConfig {
  list_selector?: string;
  item_selectors: SelectorConfig[];
  detail_page?: {
    enabled: boolean;
    url_field: string;
    selectors: SelectorConfig[];
  };
}

export const VisualSelectorBuilder = ({
  sourceUrl,
  onSave
}: {
  sourceUrl: string;
  onSave: (config: ScraperConfig) => void;
}) => {
  const [mode, setMode] = useState<'list' | 'detail'>('list');
  const [selectionMode, setSelectionMode] = useState<string | null>(null); // 'title', 'link', 'date', etc.
  const [config, setConfig] = useState<ScraperConfig>({
    item_selectors: [],
    detail_page: { enabled: false, url_field: '', selectors: [] }
  });
  const [proxyUrl, setProxyUrl] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  // Generate proxy URL to avoid CORS issues
  useEffect(() => {
    // Use a CORS proxy for loading external pages
    const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(sourceUrl)}`;
    setProxyUrl(proxy);
  }, [sourceUrl]);

  // Inject click handler into iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeLoad = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      // Add visual feedback styles
      const style = iframeDoc.createElement('style');
      style.textContent = `
        .scraper-highlight {
          outline: 3px solid #3b82f6 !important;
          outline-offset: 2px;
          cursor: pointer !important;
          background: rgba(59, 130, 246, 0.1) !important;
        }
        .scraper-selected {
          outline: 3px solid #10b981 !important;
          background: rgba(16, 185, 129, 0.2) !important;
        }
      `;
      iframeDoc.head.appendChild(style);

      // Add click handler
      iframeDoc.addEventListener('click', handleElementClick, true);
      iframeDoc.addEventListener('mouseover', handleMouseOver, true);
      iframeDoc.addEventListener('mouseout', handleMouseOut, true);
    };

    iframe.addEventListener('load', handleIframeLoad);
    return () => iframe.removeEventListener('load', handleIframeLoad);
  }, [selectionMode]);

  const handleMouseOver = (e: MouseEvent) => {
    if (!selectionMode) return;
    const element = e.target as HTMLElement;
    element.classList.add('scraper-highlight');
  };

  const handleMouseOut = (e: MouseEvent) => {
    const element = e.target as HTMLElement;
    element.classList.remove('scraper-highlight');
  };

  const handleElementClick = (e: MouseEvent) => {
    if (!selectionMode) return;

    e.preventDefault();
    e.stopPropagation();

    const element = e.target as HTMLElement;
    element.classList.add('scraper-selected');

    // Generate optimal CSS selector using @medv/finder
    const selector = finder(element, {
      root: iframeRef.current?.contentDocument?.body,
      optimizedMinLength: 2,
      threshold: 1000,
      maxNumberOfTries: 10000
    });

    // Determine what we're extracting
    let elementType: 'text' | 'link' | 'image' | 'date' = 'text';
    let attribute: string | undefined;
    let sampleValue = element.textContent?.trim() || '';

    if (element.tagName === 'A') {
      elementType = 'link';
      attribute = 'href';
      sampleValue = element.getAttribute('href') || '';
    } else if (element.tagName === 'IMG') {
      elementType = 'image';
      attribute = 'src';
      sampleValue = element.getAttribute('src') || '';
    } else if (selectionMode === 'date' || /date|time|published/i.test(element.className)) {
      elementType = 'date';
    }

    // Add to config
    const newSelector: SelectorConfig = {
      field: selectionMode,
      selector: selector,
      attribute: attribute,
      sample_value: sampleValue,
      element_type: elementType
    };

    if (mode === 'list') {
      setConfig({
        ...config,
        item_selectors: [...config.item_selectors, newSelector]
      });
    } else {
      setConfig({
        ...config,
        detail_page: {
          ...config.detail_page!,
          selectors: [...(config.detail_page?.selectors || []), newSelector]
        }
      });
    }

    // Clear selection mode
    setSelectionMode(null);

    toast({
      title: "Selector added",
      description: `${selectionMode}: ${selector}`
    });
  };

  const startSelection = (fieldName: string) => {
    setSelectionMode(fieldName);
    toast({
      title: "Selection mode active",
      description: `Click an element on the page to select ${fieldName}`
    });
  };

  const testExtraction = async () => {
    // This would make a test API call to n8n or a test endpoint
    toast({
      title: "Testing extraction",
      description: "Running test scrape..."
    });

    // TODO: Call test endpoint with config
  };

  const removeSelector = (field: string) => {
    setConfig({
      ...config,
      item_selectors: config.item_selectors.filter(s => s.field !== field)
    });
  };

  const handleSave = async () => {
    onSave(config);
    toast({
      title: "Configuration saved",
      description: "Scraper configuration has been saved"
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4 h-screen">
      {/* Left side: Website preview */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="bg-gray-100 p-2 border-b">
          <div className="flex items-center gap-2">
            <Badge variant={selectionMode ? "default" : "secondary"}>
              {selectionMode ? `Selecting: ${selectionMode}` : "Preview Mode"}
            </Badge>
            <span className="text-sm text-gray-600 ml-auto">{sourceUrl}</span>
          </div>
        </div>
        <iframe
          ref={iframeRef}
          src={proxyUrl}
          className="w-full h-full"
          sandbox="allow-same-origin allow-scripts"
          title="Website preview"
        />
      </div>

      {/* Right side: Configuration panel */}
      <div className="space-y-4 overflow-y-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Visual Selector Builder</CardTitle>
            <CardDescription>
              Click elements on the left to build your scraper configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={mode} onValueChange={(v) => setMode(v as 'list' | 'detail')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">List Page</TabsTrigger>
                <TabsTrigger value="detail">Detail Page</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                <div className="space-y-2">
                  <Label>Step 1: Select Container (Optional)</Label>
                  <p className="text-sm text-gray-600">
                    If this is a list page, click the container that wraps each item
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => startSelection('container')}
                    disabled={!!selectionMode}
                  >
                    Select Container Element
                  </Button>
                  {config.list_selector && (
                    <div className="text-sm bg-gray-50 p-2 rounded">
                      <code>{config.list_selector}</code>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Step 2: Select Fields to Extract</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => startSelection('title')}
                      disabled={!!selectionMode}
                    >
                      + Title
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => startSelection('link')}
                      disabled={!!selectionMode}
                    >
                      + Link
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => startSelection('date')}
                      disabled={!!selectionMode}
                    >
                      + Date
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => startSelection('description')}
                      disabled={!!selectionMode}
                    >
                      + Description
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => startSelection('author')}
                      disabled={!!selectionMode}
                    >
                      + Author
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => startSelection('custom')}
                      disabled={!!selectionMode}
                    >
                      + Custom Field
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Selected Fields ({config.item_selectors.length})</Label>
                  {config.item_selectors.length === 0 ? (
                    <p className="text-sm text-gray-500">No fields selected yet</p>
                  ) : (
                    <div className="space-y-2">
                      {config.item_selectors.map((selector, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between bg-gray-50 p-3 rounded border"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{selector.field}</Badge>
                              <Badge variant="outline">{selector.element_type}</Badge>
                            </div>
                            <code className="text-xs text-gray-600 mt-1 block">
                              {selector.selector}
                              {selector.attribute && `@${selector.attribute}`}
                            </code>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              Sample: {selector.sample_value}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSelector(selector.field)}
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="detail" className="space-y-4">
                <div className="space-y-2">
                  <Label>Enable Detail Page Scraping</Label>
                  <p className="text-sm text-gray-600">
                    If each item links to a detail page with more content
                  </p>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.detail_page?.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          detail_page: {
                            ...config.detail_page!,
                            enabled: e.target.checked
                          }
                        })
                      }
                    />
                    <span className="text-sm">Visit detail pages for full content</span>
                  </label>
                </div>

                {config.detail_page?.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Which field contains the detail page URL?</Label>
                      <select
                        className="w-full border rounded p-2"
                        value={config.detail_page.url_field}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            detail_page: {
                              ...config.detail_page!,
                              url_field: e.target.value
                            }
                          })
                        }
                      >
                        <option value="">Select field...</option>
                        {config.item_selectors
                          .filter(s => s.element_type === 'link')
                          .map(s => (
                            <option key={s.field} value={s.field}>
                              {s.field}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Select fields from detail page</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => startSelection('content')}
                          disabled={!!selectionMode}
                        >
                          + Main Content
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => startSelection('pdf_link')}
                          disabled={!!selectionMode}
                        >
                          + PDF Link
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => startSelection('metadata')}
                          disabled={!!selectionMode}
                        >
                          + Metadata
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Detail Page Fields ({config.detail_page.selectors.length})</Label>
                      {config.detail_page.selectors.map((selector, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between bg-gray-50 p-3 rounded border"
                        >
                          <div className="flex-1">
                            <Badge variant="secondary">{selector.field}</Badge>
                            <code className="text-xs text-gray-600 mt-1 block">
                              {selector.selector}
                            </code>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>

            <div className="pt-4 border-t space-y-2">
              <Button onClick={testExtraction} variant="outline" className="w-full">
                Test Extraction
              </Button>
              <Button onClick={handleSave} className="w-full">
                Save Configuration
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-50 p-4 rounded overflow-x-auto">
              {JSON.stringify(config, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
