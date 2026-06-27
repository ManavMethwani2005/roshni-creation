import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InquiryService } from '../../core/services/inquiry.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  // Preloader
  preloaderHidden = false; // ✦ FIX: was `true` — preloader never showed; must start as false so it's visible on load

  // Navbar
  navScrolled = false;
  mobileNavOpen = false;

  // Hero Slider
  slides = [
    'assets/images/product1.jpg', 'assets/images/product2.jpg',
    'assets/images/product3.jpg', 'assets/images/product4.jpg',
    'assets/images/product5.jpg', 'assets/images/product6.jpg',
    'assets/images/product7.jpg', 'assets/images/product8.jpg',
    'assets/images/product9.jpg',
  ];
  currentSlide = 0;
  private slideInterval: any;

  // Collections
  activeFilter = 'all';
  products: any[] = [];

  // Stats
  statsAnimated = false;
  stats = [
    { label: 'Years of Excellence', target: 25, current: 0 },
    { label: 'Unique Designs',      target: 500, current: 0 },
    { label: 'B2B Partners',        target: 200, current: 0 },
  ];

  // Lightbox
  lightboxOpen = false;
  lightboxProduct: any = null;

  // Contact Form
  contactForm: FormGroup;
  formSubmitting = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  toastVisible = false;

  constructor(
    private fb: FormBuilder,
    private inquiryService: InquiryService,
    private cdr: ChangeDetectorRef,
    private productService: ProductService
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      interest: ['other'],
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.preloaderHidden = true; // ✦ hides preloader after 800ms — now works correctly since it starts as false
      this.cdr.detectChanges();
    }, 800);
  }

  ngOnDestroy(): void {
    clearInterval(this.slideInterval);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.navScrolled = window.scrollY > 50;
    this.tryAnimateStats();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => {
        console.error('HOME PRODUCT ERROR', err);
      }
    });
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
  }

  isVisible(product: any): boolean {
    return this.activeFilter === 'all' || product.category === this.activeFilter;
  }

  openLightbox(product: any): void {
    this.lightboxProduct = product;
    this.lightboxOpen = true;
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
    this.lightboxProduct = null;
  }

  tryAnimateStats(): void {
    if (this.statsAnimated) return;
    const statsEl = document.getElementById('about');
    if (!statsEl) return;
    const rect = statsEl.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      this.statsAnimated = true;
      this.stats.forEach(stat => this.animateStat(stat));
    }
  }

  animateStat(stat: any): void {
    const duration = 2000;
    const step = duration / stat.target;
    const interval = setInterval(() => {
      stat.current++;
      if (stat.current >= stat.target) clearInterval(interval);
    }, step);
  }

  onSubmitInquiry(): void {
    if (this.contactForm.invalid) return;
    this.formSubmitting = true;
    this.inquiryService.submitInquiry(this.contactForm.value).subscribe({
      next: () => {
        this.showToast('Thank you! Your inquiry has been sent successfully.', 'success');
        this.contactForm.reset();
        this.formSubmitting = false;
      },
      error: () => {
        this.showToast('Something went wrong. Please try again.', 'error');
        this.formSubmitting = false;
      },
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    setTimeout(() => (this.toastVisible = false), 4000);
  }

  filters = [
    { key: 'all', label: 'All' },
    { key: 'palazzo', label: 'Palazzo Sets' },
    { key: 'salwar', label: 'Salwar Suits' },
    { key: 'anarkali', label: 'Anarkali' },
  ];

  craftSteps = [
    { icon: 'eco', title: 'Ethical Sourcing', text: 'Direct partnerships with cotton and silk cooperatives ensuring fair wages and sustainable harvesting practices.' },
    { icon: 'precision_manufacturing', title: 'Artisanal Weaving', text: 'Preserving handloom traditions while implementing modern quality controls for consistency and durability.' },
    { icon: 'content_cut', title: 'Precision Tailoring', text: 'Expert pattern makers translate traditional drapes into comfortable, perfectly fitted contemporary wear.' },
    { icon: 'verified', title: 'Quality Assurance', text: 'Every garment passes through rigorous quality checks before reaching our valued B2B partners.' },
  ];

  testimonials = [
    { initial: 'R', text: 'The quality of craftsmanship is exceptional. Every piece we order from Roshni Creation sells out within days.', name: 'Rajesh Kumar', role: 'Boutique Owner, Delhi' },
    { initial: 'P', text: "We've been working with Roshni Creation for over 10 years. Their consistency in quality and their ability to stay ahead of trends is remarkable.", name: 'Priya Sharma', role: 'Retail Chain, Mumbai' },
    { initial: 'S', text: "The attention to detail in every garment is what sets them apart. From fabric selection to the final stitch — it's perfection at every step.", name: 'Sameer Ansari', role: 'Wholesale Distributor, Jaipur' },
  ];
}
