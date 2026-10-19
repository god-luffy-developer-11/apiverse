import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Cache in-memory
let cachedApis: any[] | null = null;
let cachedCategories: any | null = null;

function getDatabase() {
  if (!cachedApis) {
    try {
      const filePath = path.join(process.cwd(), 'src', 'data', 'public_apis.json');
      if (fs.existsSync(filePath)) {
        cachedApis = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } else {
        // Try alternate relative path
        const altPath = path.join(process.cwd(), 'apps', 'web', 'src', 'data', 'public_apis.json');
        if (fs.existsSync(altPath)) {
          cachedApis = JSON.parse(fs.readFileSync(altPath, 'utf-8'));
        }
      }
    } catch (e) {
      console.error('Failed to read public_apis.json:', e);
      cachedApis = [];
    }
  }

  if (!cachedCategories) {
    try {
      const catPath = path.join(process.cwd(), 'src', 'data', 'categories.json');
      if (fs.existsSync(catPath)) {
        cachedCategories = JSON.parse(fs.readFileSync(catPath, 'utf-8'));
      }
    } catch (e) {
      // ignore
    }
  }

  return { apis: cachedApis || [], categories: cachedCategories };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'ALL';
  const pricing = searchParams.get('pricing') || 'ALL';
  const authType = searchParams.get('auth_type') || 'ALL';
  const search = searchParams.get('search')?.toLowerCase().trim() || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '36', 10);

  const { apis, categories } = getDatabase();

  let filtered = apis;

  if (category && category !== 'ALL') {
    filtered = filtered.filter((a) => a.category?.toLowerCase() === category.toLowerCase());
  }

  if (pricing && pricing !== 'ALL') {
    filtered = filtered.filter((a) => a.pricing?.toLowerCase() === pricing.toLowerCase());
  }

  if (authType && authType !== 'ALL') {
    filtered = filtered.filter((a) => a.authType?.toLowerCase() === authType.toLowerCase());
  }

  if (search) {
    filtered = filtered.filter((a) =>
      a.name?.toLowerCase().includes(search) ||
      a.description?.toLowerCase().includes(search) ||
      a.category?.toLowerCase().includes(search) ||
      a.constellation?.toLowerCase().includes(search) ||
      a.authRaw?.toLowerCase().includes(search)
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;
  const paginated = filtered.slice(offset, offset + limit);

  return NextResponse.json({
    total,
    page,
    limit,
    totalPages,
    apis: paginated,
    categoriesSummary: categories
  });
}
