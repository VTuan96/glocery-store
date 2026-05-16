package com.grocerystore.product;

import com.grocerystore.common.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "barcodes")
public class Barcode extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, unique = true)
    private String code;

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}
