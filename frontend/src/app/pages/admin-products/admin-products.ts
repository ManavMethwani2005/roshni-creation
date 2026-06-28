import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef   // ✦ FIX: added — required to manually trigger re-render after HTTP response
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService, Product } from '../../core/services/product.service';

type FormMode = 'add' | 'edit';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-products.html',
  styleUrls: ['./admin-products.css']
})
export class AdminProductsComponent implements OnInit {

  // ── Product list ────────────────────────────────────────────────
  products: Product[] = [];
  loading = true;

  // ── Form state ──────────────────────────────────────────────────
  formMode: FormMode = 'add';
  editingId: string | null = null;
  showForm = false;

  form = {
    title: '',
    description: '',
    category: '',
    tag: 'New Arrival',
    featured: false,
  };

  // ── Image ───────────────────────────────────────────────────────
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;

  // ── UI state ────────────────────────────────────────────────────
  submitting = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  toastVisible = false;
  filterCategory = 'all';

  categories = [
    { value: 'palazzo',  label: 'Palazzo' },
    { value: 'salwar',   label: 'Salwar' },
    { value: 'anarkali', label: 'Anarkali' },
    { value: 'lehenga',  label: 'Lehenga' },
    { value: 'kurta',    label: 'Kurta' },
  ];

  tagOptions = [
    'New Arrival', 'Bestseller', 'Featured', 'Heritage',
    'Premium', 'Exclusive', 'Limited Edition', 'Sale'
  ];

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef,             // ✦ FIX: injected — was missing entirely
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadProducts();
    }
  }

  // ── Getters ─────────────────────────────────────────────────────
  get featuredCount(): number { return this.products.filter(p => p.featured).length; }

  get filteredProducts(): Product[] {
    if (this.filterCategory === 'all') return this.products;
    return this.products.filter(p => p.category === this.filterCategory);
  }

  get formTitle(): string {
    return this.formMode === 'add' ? 'Add New Product' : 'Edit Product';
  }

 imageUrl(product: Product): string {
  if (!product.image) return 'assets/images/product1.jpg';
  // Cloudinary returns full URL directly
  if (product.image.startsWith('http')) return product.image;
  return `https://roshni-creation.onrender.com/uploads/products/${product.image}`;
}

  // ── Load ────────────────────────────────────────────────────────
  loadProducts(): void {
    this.loading = true;

    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = [...data];
        this.loading = false;
        this.cdr.detectChanges(); // ✦ FIX: added — without this, Angular doesn't re-render after HTTP response
                                  //         Data arrived (visible in console) but UI stayed at 0 / "Loading..."
      },
      error: (err) => {
        console.error('PRODUCT ERROR:', err);
        this.loading = false;
        this.cdr.detectChanges(); // ✦ FIX: also trigger on error so loading spinner clears
      }
    });
  }

  // ── Form open/close ─────────────────────────────────────────────
  openAddForm(): void {
    this.formMode = 'add';
    this.editingId = null;
    this.resetForm();
    this.showForm = true;
    this.scrollToForm();
  }

  openEditForm(product: Product): void {
    this.formMode = 'edit';
    this.editingId = product._id;
    this.form = {
      title: product.title,
      description: product.description,
      category: product.category,
      tag: product.tag,
      featured: product.featured,
    };
    this.selectedFile = null;
    this.imagePreviewUrl = this.imageUrl(product);
    this.showForm = true;
    this.scrollToForm();
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.form = { title: '', description: '', category: '', tag: 'New Arrival', featured: false };
    this.selectedFile = null;
    this.imagePreviewUrl = null;
    this.editingId = null;
  }

  scrollToForm(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  // ── Image select ────────────────────────────────────────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      this.showToast('Image must be under 10MB', 'error');
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreviewUrl = e.target?.result as string;
      this.cdr.detectChanges(); // ✦ FIX: added — FileReader callback is outside Angular zone, preview wouldn't show
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreviewUrl = null;
  }

  // ── Submit ──────────────────────────────────────────────────────
  submitForm(): void {
    if (!this.form.title.trim()) { this.showToast('Title is required', 'error'); return; }
    if (!this.form.description.trim()) { this.showToast('Description is required', 'error'); return; }
    if (!this.form.category) { this.showToast('Please select a category', 'error'); return; }
    if (this.formMode === 'add' && !this.selectedFile) { this.showToast('Please select a product image', 'error'); return; }

    const formData = new FormData();
    formData.append('title', this.form.title.trim());
    formData.append('description', this.form.description.trim());
    formData.append('category', this.form.category);
    formData.append('tag', this.form.tag);
    formData.append('featured', String(this.form.featured));
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.submitting = true;

    setTimeout(() => {
      if (this.submitting) {
        this.submitting = false;
        this.showToast('Upload timed out', 'error');
        this.cdr.detectChanges();
      }
    }, 15000);

    if (this.formMode === 'add') {
      this.productService.addProduct(formData).subscribe({
        next: (res) => {
          this.showToast('Product added successfully!', 'success');
          this.loadProducts();
          this.closeForm();
          this.submitting = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('ADD PRODUCT ERROR:', err);
          this.showToast('Failed to add product', 'error');
          this.submitting = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.productService.updateProduct(this.editingId!, formData).subscribe({
        next: () => {
          this.showToast('Product updated successfully!', 'success');
          this.loadProducts();
          this.closeForm();
          this.submitting = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.showToast(err.error?.error || 'Failed to update product', 'error');
          this.submitting = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  // ── Delete ──────────────────────────────────────────────────────
  deleteProduct(product: Product): void {
    if (!confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    this.productService.deleteProduct(product._id).subscribe({
      next: () => {
        this.showToast('Product deleted.', 'success');
        this.loadProducts();
      },
      error: (err) => {
        this.showToast(err.error?.error || 'Failed to delete product', 'error');
      }
    });
  }

  // ── Toast ───────────────────────────────────────────────────────
  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    setTimeout(() => {
      this.toastVisible = false;
      this.cdr.detectChanges();
    }, 3500);
  }
}