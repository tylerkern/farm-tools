<?php
/**
 * Plugin Name: Farm Tools 
 * Description: Practical digital tools for small-scale vegetable farmers. 
 * Version: 1.0.0
 * Author: Tyler Kern
 * License: AGPL-3.0
 */

if (!defined('ABSPATH')) {
    exit;
}

function farm_tools_transplant_shortcode($atts = []) {
    $atts = shortcode_atts(
        ['lang' => 'en'],
        $atts,
        'transplant_calculator'
    );

    $language = in_array($atts['lang'], ['en', 'ja'], true)
        ? $atts['lang']
        : 'en';
    $js_files = glob(plugin_dir_path(__FILE__) . 'assets/index-*.js');
    $css_files = glob(plugin_dir_path(__FILE__) . 'assets/index-*.css');

    if (empty($js_files)) {
        return '<p>React build not found.</p>';
    }

    if (!empty($css_files)) {
        wp_enqueue_style(
            'farm-tools-style',
            plugins_url('assets/' . basename($css_files[0]), __FILE__)
        );
    }

    wp_enqueue_script(
        'farm-tools-app',
        plugins_url('assets/' . basename($js_files[0]), __FILE__),
                      array(),
                      '1.0.0',
                      true
    );

    return '<div id="transplant-calculator-root" data-lang="' .
    esc_attr($language) .
    '"></div>';
}

add_shortcode('transplant_calculator', 'farm_tools_transplant_shortcode');

add_filter('script_loader_tag', function($tag, $handle) {
    if ($handle === 'farm-tools-app') {
        $tag = str_replace('<script ', '<script type="module" ', $tag);
    }
    return $tag;
}, 10, 2);
