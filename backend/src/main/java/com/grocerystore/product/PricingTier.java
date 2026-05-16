package com.grocerystore.product;

import com.grocerystore.common.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "pricing_tiers")
public class PricingTier extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "min_quantity", nullable = false)
    private int minQuantity;

    @Column(name = "unit_price", nullable = false)
    private long unitPrice;

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public int getMinQuantity() { return minQuantity; }
    public void setMinQuantity(int minQuantity) { this.minQuantity = minQuantity; }

    public long getUnitPrice() { return unitPrice; }
    public void setUnitPrice(long unitPrice) { this.unitPrice = unitPrice; }
}
