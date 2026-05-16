package com.grocerystore.product;

import com.grocerystore.common.BaseEntity;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
public class Product extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ProductType type;

    @Column(name = "default_price", nullable = false)
    private long defaultPrice;

    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    @Column(name = "inventory_tracked", nullable = false)
    private boolean inventoryTracked = false;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Barcode> barcodes = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<PackUnit> packUnits = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<PricingTier> pricingTiers = new ArrayList<>();

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public ProductType getType() { return type; }
    public void setType(ProductType type) { this.type = type; }

    public long getDefaultPrice() { return defaultPrice; }
    public void setDefaultPrice(long defaultPrice) { this.defaultPrice = defaultPrice; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public boolean isInventoryTracked() { return inventoryTracked; }
    public void setInventoryTracked(boolean inventoryTracked) { this.inventoryTracked = inventoryTracked; }

    public List<Barcode> getBarcodes() { return barcodes; }
    public List<PackUnit> getPackUnits() { return packUnits; }
    public List<PricingTier> getPricingTiers() { return pricingTiers; }
}
