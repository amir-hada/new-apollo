"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  defaultSiteSettings,
  loadSiteSettings,
  saveSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings";

const fieldClass = "h-9 px-3 text-sm md:text-sm";
const labelClass = "text-xs font-medium text-muted-foreground";
const areaClass = "min-h-[4.5rem] resize-none px-3 py-2 text-sm";

export function TemplatesForm() {
  const [form, setForm] = useState<SiteSettings>(defaultSiteSettings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setForm(loadSiteSettings());
    setReady(true);
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    saveSiteSettings(form);
    toast.success("قالب‌های سایت ذخیره شد");
  }

  if (!ready) return null;

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <Section title="صفحه اصلی">
        <div className="grid gap-x-3 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="عنوان بالای هیرو" htmlFor="home-eyebrow">
            <Input
              id="home-eyebrow"
              className={fieldClass}
              value={form.home.eyebrow}
              onChange={(e) =>
                setForm((f) => ({ ...f, home: { ...f.home, eyebrow: e.target.value } }))
              }
            />
          </Field>
          <Field label="عنوان اصلی" htmlFor="home-title">
            <Input
              id="home-title"
              className={fieldClass}
              value={form.home.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, home: { ...f.home, title: e.target.value } }))
              }
            />
          </Field>
          <Field label="دکمه اصلی" htmlFor="home-primary-cta">
            <Input
              id="home-primary-cta"
              className={fieldClass}
              value={form.home.primaryCtaLabel}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  home: { ...f.home, primaryCtaLabel: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="لینک دکمه اصلی" htmlFor="home-primary-href">
            <Input
              id="home-primary-href"
              className={fieldClass}
              dir="ltr"
              value={form.home.primaryCtaHref}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  home: { ...f.home, primaryCtaHref: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="دکمه ثانویه" htmlFor="home-secondary-cta">
            <Input
              id="home-secondary-cta"
              className={fieldClass}
              value={form.home.secondaryCtaLabel}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  home: { ...f.home, secondaryCtaLabel: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="لینک دکمه ثانویه" htmlFor="home-secondary-href">
            <Input
              id="home-secondary-href"
              className={fieldClass}
              dir="ltr"
              value={form.home.secondaryCtaHref}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  home: { ...f.home, secondaryCtaHref: e.target.value },
                }))
              }
            />
          </Field>
          <div className="space-y-1 sm:col-span-2 lg:col-span-3">
            <Label htmlFor="home-subtitle" className={labelClass}>
              توضیحات هیرو
            </Label>
            <Textarea
              id="home-subtitle"
              rows={2}
              className={areaClass}
              value={form.home.subtitle}
              onChange={(e) =>
                setForm((f) => ({ ...f, home: { ...f.home, subtitle: e.target.value } }))
              }
            />
          </div>
          <Field label="عنوان محصولات منتخب" htmlFor="home-featured-title">
            <Input
              id="home-featured-title"
              className={fieldClass}
              value={form.home.featuredTitle}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  home: { ...f.home, featuredTitle: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="زیرعنوان محصولات منتخب" htmlFor="home-featured-subtitle">
            <Input
              id="home-featured-subtitle"
              className={fieldClass}
              value={form.home.featuredSubtitle}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  home: { ...f.home, featuredSubtitle: e.target.value },
                }))
              }
            />
          </Field>
        </div>
      </Section>

      <Section title="نوار بالا و فوتر">
        <div className="grid gap-x-3 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="نام برند هدر" htmlFor="nav-brand">
            <Input
              id="nav-brand"
              className={fieldClass}
              value={form.navbar.brandName}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  navbar: { ...f.navbar, brandName: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="نام برند فوتر" htmlFor="footer-brand">
            <Input
              id="footer-brand"
              className={fieldClass}
              value={form.footer.brandName}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  footer: { ...f.footer, brandName: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="کپی‌رایت" htmlFor="footer-copyright">
            <Input
              id="footer-copyright"
              className={fieldClass}
              value={form.footer.copyright}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  footer: { ...f.footer, copyright: e.target.value },
                }))
              }
            />
          </Field>
          <div className="space-y-1 sm:col-span-2 lg:col-span-3">
            <Label htmlFor="footer-description" className={labelClass}>
              توضیحات فوتر
            </Label>
            <Textarea
              id="footer-description"
              rows={2}
              className={areaClass}
              value={form.footer.description}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  footer: { ...f.footer, description: e.target.value },
                }))
              }
            />
          </div>
          <Toggle
            label="نمایش جستجو"
            checked={form.navbar.showSearch}
            onChange={(v) =>
              setForm((f) => ({ ...f, navbar: { ...f.navbar, showSearch: v } }))
            }
          />
          <Toggle
            label="نمایش دسته‌ها"
            checked={form.navbar.showCategories}
            onChange={(v) =>
              setForm((f) => ({
                ...f,
                navbar: { ...f.navbar, showCategories: v },
              }))
            }
          />
          <Toggle
            label="نمایش سبد"
            checked={form.navbar.showCart}
            onChange={(v) =>
              setForm((f) => ({ ...f, navbar: { ...f.navbar, showCart: v } }))
            }
          />
        </div>
      </Section>

      <Section title="ویترین محصولات">
        <div className="grid gap-x-3 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="تعداد در هر صفحه" htmlFor="products-per-page">
            <Input
              id="products-per-page"
              type="number"
              min={1}
              className={fieldClass}
              value={form.storefront.productsPerPage}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  storefront: {
                    ...f.storefront,
                    productsPerPage: Number(e.target.value) || 12,
                  },
                }))
              }
            />
          </Field>
          <Field label="مرتب‌سازی پیش‌فرض" htmlFor="default-sort">
            <Input
              id="default-sort"
              className={fieldClass}
              dir="ltr"
              value={form.storefront.defaultSort}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  storefront: { ...f.storefront, defaultSort: e.target.value },
                }))
              }
            />
          </Field>
          <Toggle
            label="نمایش فیلترها"
            checked={form.storefront.showFilters}
            onChange={(v) =>
              setForm((f) => ({
                ...f,
                storefront: { ...f.storefront, showFilters: v },
              }))
            }
          />
          <Toggle
            label="نمایش برند"
            checked={form.storefront.showBrand}
            onChange={(v) =>
              setForm((f) => ({
                ...f,
                storefront: { ...f.storefront, showBrand: v },
              }))
            }
          />
          <Toggle
            label="نمایش ناموجود"
            checked={form.storefront.showOutOfStock}
            onChange={(v) =>
              setForm((f) => ({
                ...f,
                storefront: { ...f.storefront, showOutOfStock: v },
              }))
            }
          />
        </div>
      </Section>

      <div className="flex justify-end pt-0.5">
        <Button type="submit" className="h-10 px-5">
          ذخیره تغییرات
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {children}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={htmlFor} className={labelClass}>
        {label}
      </Label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-2.5 py-2">
      <Label className="mb-0 text-sm font-normal">{label}</Label>
      <Switch checked={checked} onCheckedChange={(v) => onChange(!!v)} />
    </div>
  );
}
